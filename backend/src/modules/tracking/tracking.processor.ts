import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RouteSnapshot } from '../../database/entities/route-snapshot.entity';
import { RedisService } from '../../redis/redis.service';

@Processor('tracking')
export class TrackingProcessor extends WorkerHost {
  constructor(
    @InjectRepository(RouteSnapshot)
    private routeSnapshotsRepository: Repository<RouteSnapshot>,
    private redisService: RedisService,
  ) {
    super();
  }

  async process(job: Job<any>): Promise<any> {
    if (job.name === 'flush-route') {
      const { orderId, driverId } = job.data;
      console.log(`Flushing route for order ${orderId}...`);

      // 1. Lấy toàn bộ tọa độ từ Redis Sorted Set
      const routeData = await this.redisService.zRangeByScore(`route:${orderId}`, '-inf', '+inf');
      
      if (!routeData || routeData.length === 0) {
        console.log(`No route data found for order ${orderId}`);
        return;
      }

      const coordinates = routeData.map(item => JSON.parse(item));
      
      // 2. Tính toán các thông số tổng hợp
      const startedAt = coordinates[0].timestamp;
      const endedAt = coordinates[coordinates.length - 1].timestamp;
      
      // Tính tổng quãng đường
      let totalDistanceKm = 0;
      for (let i = 1; i < coordinates.length; i++) {
        totalDistanceKm += this.haversine(coordinates[i - 1], coordinates[i]);
      }

      const totalDurationSec = Math.floor(
        (new Date(endedAt).getTime() - new Date(startedAt).getTime()) / 1000
      );

      // 3. Lưu vào database
      const snapshot = this.routeSnapshotsRepository.create({
        orderId,
        driverId,
        coordinates,
        totalDistanceKm: Number(totalDistanceKm.toFixed(2)),
        totalDurationSec,
        startedAt: new Date(startedAt),
        endedAt: new Date(endedAt),
      });

      await this.routeSnapshotsRepository.save(snapshot);

      // 4. Dọn dẹp Redis
      await this.redisService.del(`route:${orderId}`);
      // Lưu ý: Không xóa driver:locations vì driver có thể chuyển sang order khác ngay
      
      console.log(`Route for order ${orderId} flushed successfully. Total distance: ${totalDistanceKm.toFixed(2)} km`);
    }
  }

  private haversine(
    coords1: { lat: number; lng: number },
    coords2: { lat: number; lng: number },
  ): number {
    const R = 6371;
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
}
