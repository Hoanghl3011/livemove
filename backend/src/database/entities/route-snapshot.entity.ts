import { Entity, PrimaryGeneratedColumn, Column, OneToOne, JoinColumn, CreateDateColumn } from 'typeorm';
import { Order } from './order.entity';

@Entity('route_snapshots')
export class RouteSnapshot {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'order_id' })
  orderId: string;

  @OneToOne(() => Order)
  @JoinColumn({ name: 'order_id' })
  order: Order;

  @Column({ name: 'driver_id' })
  driverId: string;

  @Column({ type: 'jsonb' })
  coordinates: { lat: number; lng: number; timestamp: Date }[];

  @Column({ name: 'total_distance_km', type: 'decimal', precision: 8, scale: 2, nullable: true })
  totalDistanceKm: number;

  @Column({ name: 'total_duration_sec', type: 'int', nullable: true })
  totalDurationSec: number;

  @Column({ name: 'started_at', nullable: true })
  startedAt: Date;

  @Column({ name: 'ended_at', nullable: true })
  endedAt: Date;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
