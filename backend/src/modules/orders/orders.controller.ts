import { Controller, Post, Body, Get, Param, Patch, Delete, UseGuards, Request, BadRequestException } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { UserRole } from '../../database/entities/user.entity';
import { OrderStatus } from '../../database/entities/order.entity';
import { NotificationsService } from '../notifications/notifications.service';
import { TrackingGateway } from '../tracking/tracking.gateway';
import { TrackingService } from '../tracking/tracking.service';
import { NotificationChannel, RecipientType } from '../../database/entities/notification.entity';

@Controller('orders')
export class OrdersController {
  constructor(
    private ordersService: OrdersService,
    private notificationsService: NotificationsService,
    private trackingGateway: TrackingGateway,
    private trackingService: TrackingService,
  ) {}

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.STAFF)
  @Post()
  async create(@Body() body: any, @Request() req: any) {
    return this.ordersService.create({
      ...body,
      companyId: req.user.companyId,
    });
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  async findAll(@Request() req: any) {
    if (req.user.role === UserRole.DRIVER) {
      return this.ordersService.findByDriverId(req.user.sub);
    }
    if (req.user.role === UserRole.RECEIVER) {
      // Find by receiverId (linked account) AND by phone (orders created with matching phone)
      const [byId, byPhone] = await Promise.all([
        this.ordersService.findForReceiver(req.user.sub),
        req.user.phone
          ? this.ordersService.findForReceiverByPhone(req.user.phone)
          : Promise.resolve([]),
      ]);
      // Merge and deduplicate by id
      const merged = [...byId];
      for (const o of byPhone) {
        if (!merged.find(m => m.id === o.id)) merged.push(o);
      }
      return merged.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }
    return this.ordersService.findAll(req.user.companyId);
  }

  @UseGuards(JwtAuthGuard)
  @Get('assigned')
  async findAssigned(@Request() req: any) {
    return this.ordersService.findByDriverId(req.user.sub);
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.ordersService.findOne(id);
  }

  @Get(':id/track')
  async getTrackingInfo(@Param('id') id: string) {
    const order = await this.ordersService.findOne(id);
    if (!order) {
      throw new BadRequestException('Order not found');
    }
    // Return only necessary info for public tracking
    return {
       id: order.id,
       orderCode: order.orderCode,
       status: order.status,
       pickupAddress: order.pickupAddress,
       pickupLat: order.pickupLat,
       pickupLng: order.pickupLng,
       deliveryAddress: order.deliveryAddress,
       deliveryLat: order.deliveryLat,
       deliveryLng: order.deliveryLng,
       customerName: order.receiverName, // Receiver info as customer name for tracking
       receiverName: order.receiverName, 
       receiverPhone: order.receiverPhone,
       driver: order.driver ? {
         fullName: order.driver.fullName,
         licensePlate: order.driver.licensePlate,
       } : null,
    };
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id/status')
  async updateStatus(@Param('id') id: string, @Body('status') status: OrderStatus) {
    return this.ordersService.updateStatus(id, status);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.STAFF)
  @Patch(':id/assign')
  async assignDriver(@Param('id') id: string, @Body('driverId') driverId: string) {
    const updatedOrder = await this.ordersService.assignDriver(id, driverId);
    if (updatedOrder) {
      // Notify asynchronously
      await this.notificationsService.pushNotification({
        orderId: updatedOrder.id,
        recipientId: driverId,
        recipientType: RecipientType.DRIVER,
        channel: NotificationChannel.FCM,
        title: '🚚 Bạn có đơn hàng mới!',
        body: `Đơn hàng ${updatedOrder.orderCode} đã được giao cho bạn. Lấy hàng tại: ${updatedOrder.pickupAddress.substring(0, 50)}...`,
      });
    }
    return updatedOrder;
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.STAFF)
  @Patch(':id')
  async update(@Param('id') id: string, @Body() body: any) {
    return this.ordersService.update(id, body);
  }
  
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Delete(':id')
  async remove(@Param('id') id: string) {
    return this.ordersService.updateStatus(id, OrderStatus.CANCELLED);
  }

  @UseGuards(JwtAuthGuard)
  @Post('scan-qr')
  async scanQr(@Body('qrCode') qrCode: string, @Request() req: any) {
    const order = await this.ordersService.findByQrCode(qrCode);
    if (!order) {
      throw new BadRequestException('Invalid QR Code');
    }

    if (order.companyId !== req.user.companyId) {
      throw new BadRequestException('Order does not belong to your company');
    }

    if (order.status !== OrderStatus.PENDING && order.status !== OrderStatus.ASSIGNED) {
      throw new BadRequestException('Order is already being processed or delivered');
    }

    const updatedOrder = await this.ordersService.updateStatus(order.id, OrderStatus.PICKED_UP);

    // Notify asynchronously
    await this.notificationsService.pushNotification({
      orderId: order.id,
      recipientId: order.receiverId || 'system',
      recipientType: RecipientType.USER,
      channel: NotificationChannel.FCM,
      title: '📦 Đơn hàng đã được lấy!',
      body: `Đơn hàng ${order.orderCode} đã được tài xế lấy.`,
    });

    // Broadcast via socket
    this.trackingGateway.broadcastOrderStatus(order.id, OrderStatus.PICKED_UP, {
      orderCode: order.orderCode,
    });

    return {
      message: 'Order picked up successfully',
      order: updatedOrder,
    };
  }

  // ===== SIMULATION ENDPOINTS (For Demo) =====

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.STAFF)
  @Post(':id/simulate')
  async simulateDelivery(@Param('id') id: string) {
    const order = await this.ordersService.findOne(id);
    if (!order) {
      throw new BadRequestException('Order not found');
    }

    if (this.trackingService.isSimulating(id)) {
      throw new BadRequestException('Simulation is already running for this order');
    }

    // Auto-transition to IN_TRANSIT if not already
    if (order.status !== OrderStatus.IN_TRANSIT) {
      await this.ordersService.updateStatus(id, OrderStatus.IN_TRANSIT);
    }

    // Start simulation - emit to socket room
    const isFastTrack = id === '27fb2035-369f-45fe-bda1-7de164e7df10';
    await this.trackingService.startSimulation(
      id,
      order,
      (data) => {
        this.trackingGateway.getServer().to(`order:${id}`).emit('tracking:update', data);
      },
      async () => {
        // On complete: mark as delivered
        await this.ordersService.updateStatus(id, OrderStatus.DELIVERED);
        this.trackingGateway.broadcastOrderStatus(id, OrderStatus.DELIVERED, {
          orderCode: order.orderCode,
        });
      },
      isFastTrack,
    );

    return { message: `🎬 Simulation started for order ${order.orderCode}` };
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.STAFF)
  @Post(':id/stop-simulate')
  async stopSimulation(@Param('id') id: string) {
    const stopped = this.trackingService.stopSimulation(id);
    if (!stopped) {
      throw new BadRequestException('No active simulation for this order');
    }
    return { message: 'Simulation stopped' };
  }
}
