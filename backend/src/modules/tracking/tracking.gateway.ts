import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { UseGuards } from '@nestjs/common';
import { ThrottlerGuard, Throttle } from '@nestjs/throttler';
import { WsJwtGuard } from './ws-jwt.guard';
import { TrackingService } from './tracking.service';
import { OrdersService } from '../orders/orders.service';
import { OrderStatus } from '../../database/entities/order.entity';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class TrackingGateway implements OnGatewayConnection, OnGatewayDisconnect {
  constructor(
    private trackingService: TrackingService,
    private ordersService: OrdersService,
  ) {}

  @WebSocketServer()
  server: Server;

  handleConnection(client: Socket) {
    console.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    console.log(`Client disconnected: ${client.id}`);
  }

  @SubscribeMessage('tracking:subscribe')
  async handleSubscribe(client: Socket, data: { orderId: string }) {
    const { orderId } = data;
    // TODO: Thêm logic kiểm tra quyền của User đối với Order này (nếu cần)
    client.join(`order:${orderId}`);
    return { event: 'subscribed', data: orderId };
  }

  @SubscribeMessage('tracking:unsubscribe')
  handleUnsubscribe(client: Socket, data: { orderId: string }) {
    client.leave(`order:${data.orderId}`);
    return { event: 'unsubscribed', data: data.orderId };
  }

  @UseGuards(WsJwtGuard, ThrottlerGuard)
  @Throttle({ default: { limit: 1, ttl: 3000 } })
  @SubscribeMessage('driver:location')
  async handleLocationUpdate(
    client: Socket,
    data: { orderId: string; lat: number; lng: number; heading?: number; speed?: number },
  ) {
    const { orderId, lat, lng, heading, speed } = data;
    const user = client.data.user; // Set by WsJwtGuard 

    // BỎ QUA vị trí thật từ App nếu hệ thống ĐANG CHẠY MÔ PHỎNG cho đơn hàng này
    if (orderId && this.trackingService.isSimulating(orderId)) {
      return;
    }

    // 1. Cập nhật vị trí driver trong Redis
    await this.trackingService.updateDriverCurrentLocation(user.id, lat, lng);

    // 2. Nếu driver đang trong 1 order cụ thể, lưu vào hành trình
    if (orderId) {
      await this.trackingService.saveLocationToHistory(orderId, lat, lng);

      // Lấy thông tin đơn hàng để tính toán tiến trình
      const order = await this.ordersService.findOne(orderId);
      if (order && order.status === OrderStatus.IN_TRANSIT) {
        const progress = this.trackingService.calculateDeliveryProgress(lat, lng, order);

        // 3. Broadcast tới các receiver đang xem order này
        this.server.to(`order:${orderId}`).emit('tracking:update', {
          orderId,
          lat,
          lng,
          heading,
          speed,
          ...progress,
          timestamp: new Date(),
        });
      }
    }
  }

  getServer(): Server {
    return this.server;
  }

  broadcastOrderStatus(orderId: string, status: string, data: any) {
    this.server.to(`order:${orderId}`).emit('order:status:changed', {
      orderId,
      status,
      ...data,
    });
  }
}
