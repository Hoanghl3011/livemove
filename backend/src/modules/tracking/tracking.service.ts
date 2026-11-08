import { Injectable } from '@nestjs/common';
import { RedisService } from '../../redis/redis.service';
import { Order } from '../../database/entities/order.entity';

const OSRM_URL = 'https://router.project-osrm.org/route/v1/driving/';

@Injectable()
export class TrackingService {
  private activeSimulations = new Map<string, NodeJS.Timeout>();
  
  constructor(private redisService: RedisService) {}

  /**
   * Tính toán tiến trình giao hàng, khoảng cách còn lại và ETA
   */
  calculateDeliveryProgress(currentLat: number, currentLng: number, order: Order) {
    const totalDistance = this.haversine(
      { lat: Number(order.pickupLat), lng: Number(order.pickupLng) },
      { lat: Number(order.deliveryLat), lng: Number(order.deliveryLng) },
    );

    const distanceRemaining = this.haversine(
      { lat: currentLat, lng: currentLng },
      { lat: Number(order.deliveryLat), lng: Number(order.deliveryLng) },
    );

    // Giới hạn progress từ 0% đến 100%
    const progressPercent = Math.min(
      100,
      Math.max(0, ((totalDistance - distanceRemaining) / totalDistance) * 100),
    );

    // ETA dựa trên tốc độ trung bình (ví dụ 30km/h cho khu vực nội thành)
    const avgSpeedKmH = 30; 
    const etaMinutes = Math.ceil((distanceRemaining / avgSpeedKmH) * 60);

    return {
      progressPercent: Math.round(progressPercent),
      distanceRemaining: Number(distanceRemaining.toFixed(2)),
      etaMinutes,
    };
  }

  /**
   * Lấy route thực tế từ OSRM (Open Source Routing Machine)
   */
  async fetchRouteFromOSRM(
    pickup: { lat: number; lng: number },
    delivery: { lat: number; lng: number },
  ): Promise<{ lat: number; lng: number }[]> {
    const url = `${OSRM_URL}${pickup.lng},${pickup.lat};${delivery.lng},${delivery.lat}?overview=full&geometries=geojson`;
    
    try {
      const response = await fetch(url);
      const data = await response.json();
      
      if (data.routes && data.routes.length > 0) {
        return data.routes[0].geometry.coordinates.map((coord: number[]) => ({
          lat: coord[1],
          lng: coord[0],
        }));
      }
    } catch (error) {
      console.error('OSRM fetch error:', error);
    }
    
    // Fallback: tạo route thẳng nếu OSRM lỗi
    const steps = 30;
    const route: { lat: number; lng: number }[] = [];
    for (let i = 0; i <= steps; i++) {
      route.push({
        lat: pickup.lat + (delivery.lat - pickup.lat) * (i / steps),
        lng: pickup.lng + (delivery.lng - pickup.lng) * (i / steps),
      });
    }
    return route;
  }

  /**
   * Bắt đầu mô phỏng di chuyển tài xế dọc route
   * emitFn: callback để phát sự kiện socket
   */
  async startSimulation(
    orderId: string,
    order: Order,
    emitFn: (data: any) => void,
    onComplete: () => void,
    isFastTrack = false,
  ): Promise<void> {
    // Dừng simulation cũ nếu có
    this.stopSimulation(orderId);
    
    const route = await this.fetchRouteFromOSRM(
      { lat: Number(order.pickupLat), lng: Number(order.pickupLng) },
      { lat: Number(order.deliveryLat), lng: Number(order.deliveryLng) },
    );
    
    console.log(`🎬 Simulation started for order ${orderId} with ${route.length} route points`);
    
    let currentPointIndex = 0;
    
    // Trạng thái giả lập chân thực
    let currentLat = route[0].lat;
    let currentLng = route[0].lng;

    // Tính toán tổng quãng đường để set vận tốc 1 phút nếu là FastTrack
    const totalDistance = this.haversine(
      { lat: Number(order.pickupLat), lng: Number(order.pickupLng) },
      { lat: Number(order.deliveryLat), lng: Number(order.deliveryLng) },
    );

    let SPEED_KMH = 40; 
    if (isFastTrack) {
        // Vận tốc để hoàn thành quãng đường trong 60s
        SPEED_KMH = totalDistance * 60; // km/phút * 60 = km/h
    }
    const SPEED_KM_S = SPEED_KMH / 3600; // km/giây

    let stopTimer = 0; // Giả lập kẹt xe/đèn đỏ
    
    const tick = () => {
      // 1. Kiểm tra hoàn thành
      if (currentPointIndex >= route.length - 1) {
        console.log(`✅ Simulation completed for order ${orderId}`);
        this.stopSimulation(orderId);
        onComplete();
        return;
      }
      
      const nextPoint = route[currentPointIndex + 1];
      const distToNextNode = this.haversine(
        { lat: currentLat, lng: currentLng },
        { lat: nextPoint.lat, lng: nextPoint.lng }
      );
      
      let intervalMs = 5000;
      let isMoving = true;
      let heading = Math.atan2(nextPoint.lng - currentLng, nextPoint.lat - currentLat) * (180 / Math.PI);
      
      const progress = this.calculateDeliveryProgress(currentLat, currentLng, order);
      const distToDestKm = progress.distanceRemaining;

      // Giả lập trạng thái đứng yên (Đèn đỏ / Tắc đường) để kích hoạt chu kỳ 60s
      if (stopTimer > 0 && !isFastTrack) {
         isMoving = false;
         intervalMs = 60000; // Lên tới 60s khi đứng yên (Tối ưu pin)
         stopTimer--;
         console.log(`🚦 Driver simulates stopped. Next update in 60s for Battery Saving.`);
      } else {
         // Chu kỳ gửi vị trí theo chuẩn Adaptive Tracking (workflow.md)
         if (isFastTrack) {
            intervalMs = 1000; // 1s/lần cho mượt
         } else if (distToDestKm < 0.5) {
            intervalMs = 3000; // 3s/lần khi gần đích (<500m)
         } else {
            intervalMs = 7000; // 5-10s khi đang đi bình thường (chọn 7s)
         }

         // Xác suất 10% tài xế dừng đèn đỏ nếu cách xa đích >1km
         if (!isFastTrack && Math.random() < 0.1 && distToDestKm > 1.0) {
            stopTimer = 1; // Dừng trong 1 nhịp tiếp theo
         }

         // Tính toán vị trí tiếp theo dựa trên vận tốc thật
         const distanceMovedThisTick = SPEED_KM_S * (intervalMs / 1000); 

         if (distToNextNode <= distanceMovedThisTick) {
             currentLat = nextPoint.lat;
             currentLng = nextPoint.lng;
             currentPointIndex++;
         } else {
             // Nội suy (Interpolate) điểm tiếp theo trên đoạn đường
             const ratio = distanceMovedThisTick / distToNextNode;
             currentLat += (nextPoint.lat - currentLat) * ratio;
             currentLng += (nextPoint.lng - currentLng) * ratio;
         }
      }

      // Phát sự kiện tracking
      emitFn({
        orderId,
        lat: currentLat,
        lng: currentLng,
        heading,
        speed: isMoving ? SPEED_KMH / 3.6 : 0, // m/s
        ...progress,
        isMoving,
        driverName: order.driver?.fullName || 'Tài xế',
        licensePlate: order.driver?.licensePlate || '---',
        orderStatus: 'IN_TRANSIT',
        timestamp: new Date(),
      });
      
      // Lưu vào Redis cho Admin/Customer truy xuất
      this.updateDriverCurrentLocation(order.driverId, currentLat, currentLng);
      this.saveLocationToHistory(orderId, currentLat, currentLng);
      
      const timer = setTimeout(tick, intervalMs);
      this.activeSimulations.set(orderId, timer);
    };
    
    // Bắt đầu di chuyển
    tick();
  }

  /**
   * Dừng mô phỏng
   */
  stopSimulation(orderId: string): boolean {
    const timer = this.activeSimulations.get(orderId);
    if (timer) {
      clearTimeout(timer);
      this.activeSimulations.delete(orderId);
      console.log(`⏹️ Simulation stopped for order ${orderId}`);
      return true;
    }
    return false;
  }

  isSimulating(orderId: string): boolean {
    return this.activeSimulations.has(orderId);
  }

  /**
   * Công thức Haversine để tính khoảng cách giữa 2 tọa độ (km)
   */
  private haversine(
    coords1: { lat: number; lng: number },
    coords2: { lat: number; lng: number },
  ): number {
    const R = 6371; // Bán kính Trái đất tính bằng km
    const dLat = (coords2.lat - coords1.lat) * (Math.PI / 180);
    const dLon = (coords2.lng - coords1.lng) * (Math.PI / 180);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(coords1.lat * (Math.PI / 180)) *
        Math.cos(coords2.lat * (Math.PI / 180)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  async saveLocationToHistory(orderId: string, lat: number, lng: number) {
    const timestamp = Date.now();
    await this.redisService.zAdd(
      `route:${orderId}`,
      timestamp,
      JSON.stringify({ lat, lng, timestamp: new Date(timestamp) }),
    );
  }

  async updateDriverCurrentLocation(driverId: string, lat: number, lng: number) {
    await this.redisService.geoAdd('driver:locations', lng, lat, driverId);
  }
}

