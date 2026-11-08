import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Not } from 'typeorm';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { Order, OrderStatus } from '../../database/entities/order.entity';
import { UsersService } from '../users/users.service';
import { v4 as uuidv4 } from 'uuid';
import * as QRCode from 'qrcode';
import { join } from 'path';
import { existsSync, mkdirSync } from 'fs';

@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(Order)
    private ordersRepository: Repository<Order>,
    @InjectQueue('tracking')
    private trackingQueue: Queue,
    private usersService: UsersService,
  ) {}

  async create(orderData: Partial<Order>): Promise<Order> {
    const qrCode = uuidv4();
    const orderCode = await this.generateOrderCode();
    
    // Generate QR Image
    const qrImageUrl = await this.generateQRImage(qrCode);

    // Auto-link receiverId if a user account exists with matching phone
    let receiverId = orderData.receiverId;
    if (!receiverId && orderData.receiverPhone) {
      const matchedUser = await this.usersService.findByPhone(orderData.receiverPhone);
      if (matchedUser) {
        receiverId = matchedUser.id;
      }
    }

    const order = this.ordersRepository.create({
      ...orderData,
      receiverId,
      orderCode,
      qrCode,
      qrImageUrl,
      status: OrderStatus.PENDING,
    });

    return this.ordersRepository.save(order);
  }

  async findByQrCode(qrCode: string): Promise<Order | null> {
    return this.ordersRepository.findOne({
      where: { qrCode },
      relations: ['company', 'driver'],
    });
  }

  async updateStatus(id: string, status: OrderStatus): Promise<Order | null> {
    await this.ordersRepository.update(id, { 
      status,
      pickedUpAt: status === OrderStatus.PICKED_UP ? new Date() : undefined,
      inTransitAt: status === OrderStatus.IN_TRANSIT ? new Date() : undefined,
      deliveredAt: status === OrderStatus.DELIVERED ? new Date() : undefined,
      cancelledAt: status === OrderStatus.CANCELLED ? new Date() : undefined,
    });

    if (status === OrderStatus.DELIVERED) {
      const order = await this.ordersRepository.findOne({ where: { id } });
      if (order) {
        await this.trackingQueue.add('flush-route', {
          orderId: order.id,
          driverId: order.driverId,
        });
      }
    }

    return this.ordersRepository.findOne({ where: { id } });
  }

  async assignDriver(id: string, driverId: string): Promise<Order | null> {
    await this.ordersRepository.update(id, {
      driverId,
      status: OrderStatus.ASSIGNED,
      assignedAt: new Date(),
    });
    return this.findOne(id);
  }

  async update(id: string, updateData: Partial<Order>): Promise<Order | null> {
    await this.ordersRepository.update(id, updateData);
    return this.findOne(id);
  }


  private async generateOrderCode(): Promise<string> {
    const today = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const count = await this.ordersRepository.count();
    return `ORD-${today}-${(count + 1).toString().padStart(3, '0')}`;
  }

  private async generateQRImage(qrData: string): Promise<string> {
    const fileName = `${qrData}.png`;
    const publicPath = join(process.cwd(), 'public', 'qrcodes');
    if (!existsSync(publicPath)) {
      mkdirSync(publicPath, { recursive: true });
    }
    const filePath = join(publicPath, fileName);
    await QRCode.toFile(filePath, qrData);
    return `/qrcodes/${fileName}`;
  }

  async findAll(companyId: string): Promise<Order[]> {
    return this.ordersRepository.find({ 
      where: { companyId }, 
      relations: ['driver'],
      order: { createdAt: 'DESC' } 
    });
  }

  async findByDriverId(driverId: string): Promise<Order[]> {
    return this.ordersRepository.find({
      where: { driverId, status: Not(OrderStatus.DELIVERED) },
      relations: ['company', 'receiver'],
      order: { createdAt: 'DESC' }
    });
  }

  async findForReceiver(userId: string): Promise<Order[]> {
    return this.ordersRepository.find({
      where: { receiverId: userId },
      relations: ['driver', 'company'],
      order: { createdAt: 'DESC' }
    });
  }

  async findForReceiverByPhone(phone: string): Promise<Order[]> {
    return this.ordersRepository.find({
      where: { receiverPhone: phone },
      relations: ['driver', 'company'],
      order: { createdAt: 'DESC' }
    });
  }

  async findOne(id: string): Promise<Order | null> {
    return this.ordersRepository.findOne({ 
      where: { id }, 
      relations: ['driver', 'company', 'receiver'] 
    });
  }
}
