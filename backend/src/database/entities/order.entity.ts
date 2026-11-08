import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { Company } from './company.entity';
import { Driver } from './driver.entity';
import { User } from './user.entity';

export enum OrderStatus {
  PENDING = 'PENDING',
  ASSIGNED = 'ASSIGNED',
  PICKED_UP = 'PICKED_UP',
  IN_TRANSIT = 'IN_TRANSIT',
  DELIVERED = 'DELIVERED',
  CANCELLED = 'CANCELLED',
}

@Entity('orders')
export class Order {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'order_code', unique: true })
  orderCode: string;

  @Column({ name: 'company_id' })
  companyId: string;

  @ManyToOne(() => Company, (company) => company.orders)
  @JoinColumn({ name: 'company_id' })
  company: Company;

  @Column({ name: 'driver_id', nullable: true })
  driverId: string;

  @ManyToOne(() => Driver, (driver) => driver.orders)
  @JoinColumn({ name: 'driver_id' })
  driver: Driver;

  @Column({ name: 'receiver_id', nullable: true })
  receiverId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'receiver_id' })
  receiver: User;

  @Column({ name: 'qr_code', unique: true })
  qrCode: string;

  @Column({ name: 'qr_image_url', length: 500, nullable: true })
  qrImageUrl: string;

  @Column({ type: 'enum', enum: OrderStatus, default: OrderStatus.PENDING })
  status: OrderStatus;

  @Column({ name: 'pickup_address', type: 'text' })
  pickupAddress: string;

  @Column({ name: 'pickup_lat', type: 'decimal', precision: 10, scale: 7, nullable: true })
  pickupLat: number;

  @Column({ name: 'pickup_lng', type: 'decimal', precision: 10, scale: 7, nullable: true })
  pickupLng: number;

  @Column({ name: 'delivery_address', type: 'text' })
  deliveryAddress: string;

  @Column({ name: 'delivery_lat', type: 'decimal', precision: 10, scale: 7 })
  deliveryLat: number;

  @Column({ name: 'delivery_lng', type: 'decimal', precision: 10, scale: 7 })
  deliveryLng: number;

  @Column({ name: 'receiver_name' })
  receiverName: string;

  @Column({ name: 'receiver_phone' })
  receiverPhone: string;

  @Column({ name: 'package_description', type: 'text', nullable: true })
  packageDescription: string;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @Column({ name: 'eta_minutes', type: 'int', nullable: true })
  etaMinutes: number;

  @Column({ name: 'assigned_at', nullable: true })
  assignedAt: Date;

  @Column({ name: 'picked_up_at', nullable: true })
  pickedUpAt: Date;

  @Column({ name: 'in_transit_at', nullable: true })
  inTransitAt: Date;

  @Column({ name: 'delivered_at', nullable: true })
  deliveredAt: Date;

  @Column({ name: 'cancelled_at', nullable: true })
  cancelledAt: Date;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', nullable: true })
  updatedAt: Date;
}
