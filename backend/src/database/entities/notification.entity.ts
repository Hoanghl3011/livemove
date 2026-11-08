import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Order } from './order.entity';

export enum RecipientType {
  USER = 'USER',
  DRIVER = 'DRIVER',
}

export enum NotificationChannel {
  FCM = 'FCM',
  SOCKET = 'SOCKET',
  SMS = 'SMS',
}

export enum NotificationStatus {
  PENDING = 'PENDING',
  SENT = 'SENT',
  DELIVERED = 'DELIVERED',
  FAILED = 'FAILED',
}

@Entity('notifications')
export class Notification {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'order_id' })
  orderId: string;

  @ManyToOne(() => Order)
  @JoinColumn({ name: 'order_id' })
  order: Order;

  @Column({ name: 'recipient_id' })
  recipientId: string;

  @Column({ name: 'recipient_type', type: 'enum', enum: RecipientType })
  recipientType: RecipientType;

  @Column({ type: 'enum', enum: NotificationChannel })
  channel: NotificationChannel;

  @Column()
  title: string;

  @Column({ type: 'text' })
  body: string;

  @Column({ type: 'jsonb', nullable: true })
  payload: any;

  @Column({ type: 'enum', enum: NotificationStatus, default: NotificationStatus.PENDING })
  status: NotificationStatus;

  @Column({ name: 'fcm_message_id', nullable: true })
  fcmMessageId: string;

  @Column({ name: 'error_message', type: 'text', nullable: true })
  errorMessage: string;

  @Column({ name: 'sent_at', nullable: true })
  sentAt: Date;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
