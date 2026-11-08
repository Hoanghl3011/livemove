import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { User } from './user.entity';
import { Driver } from './driver.entity';
import { Order } from './order.entity';

@Entity('companies')
export class Company {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ unique: true, nullable: true })
  email: string;

  @Column()
  phone: string;

  @Column({ type: 'text', nullable: true })
  address: string;

  @Column({ name: 'logo_url', length: 500, nullable: true })
  logoUrl: string;

  @Column({ type: 'jsonb', default: {} })
  settings: any;

  @Column({ name: 'is_active', default: true })
  isActive: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', nullable: true })
  updatedAt: Date;

  @OneToMany(() => User, (user) => user.company)
  users: User[];

  @OneToMany(() => Driver, (driver) => driver.company)
  drivers: Driver[];

  @OneToMany(() => Order, (order) => order.company)
  orders: Order[];
}
