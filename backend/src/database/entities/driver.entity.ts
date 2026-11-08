import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { Company } from './company.entity';
import { Order } from './order.entity';

@Entity('drivers')
export class Driver {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'company_id' })
  companyId: string;

  @ManyToOne(() => Company, (company) => company.drivers)
  @JoinColumn({ name: 'company_id' })
  company: Company;

  @Column({ name: 'full_name' })
  fullName: string;

  @Column({ unique: true })
  phone: string;

  @Column({ name: 'password_hash', select: false })
  passwordHash: string;

  @Column({ name: 'license_plate' })
  licensePlate: string;

  @Column({ name: 'vehicle_type', nullable: true })
  vehicleType: string;

  @Column({ name: 'avatar_url', length: 500, nullable: true })
  avatarUrl: string;

  @Column({ name: 'fcm_token', length: 500, nullable: true })
  fcmToken: string;

  @Column({ name: 'is_active', default: true })
  isActive: boolean;

  @Column({ name: 'is_online', default: false })
  isOnline: boolean;

  @Column({ name: 'last_lat', type: 'decimal', precision: 10, scale: 7, nullable: true })
  lastLat: number;

  @Column({ name: 'last_lng', type: 'decimal', precision: 10, scale: 7, nullable: true })
  lastLng: number;

  @Column({ name: 'last_location_at', nullable: true })
  lastLocationAt: Date;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', nullable: true })
  updatedAt: Date;

  @OneToMany(() => Order, (order) => order.driver)
  orders: Order[];
}
