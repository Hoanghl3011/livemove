import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';
import { Company } from '../entities/company.entity';
import { User, UserRole } from '../entities/user.entity';
import { Driver } from '../entities/driver.entity';

@Injectable()
export class TestDataSeed {
  constructor(
    @InjectRepository(Company) private companyRepo: Repository<Company>,
    @InjectRepository(User) private userRepo: Repository<User>,
    @InjectRepository(Driver) private driverRepo: Repository<Driver>,
  ) {}

  async seed() {
    console.log('🌱 Seeding test data...');

    // 1. Tạo Company
    const company = await this.companyRepo.save({
      id: uuidv4(),
      name: 'Livemove Test Company',
      email: 'company@livemove.com',
      phone: '0912345678',
      address: '123 Nguyễn Huệ, Q.1, TP.HCM',
      isActive: true,
    });
    console.log('✅ Company created:', company.id);

    // 2. Tạo Admin User
    const adminPassword = await bcrypt.hash('Admin@123456', 10);
    const admin = await this.userRepo.save({
      id: uuidv4(),
      companyId: company.id,
      email: 'admin@livemove.com',
      passwordHash: adminPassword,
      fullName: 'Admin Livemove',
      phone: '0901111111',
      role: UserRole.ADMIN,
      isActive: true,
    });
    console.log('✅ Admin user created:', admin.id);

    // 3. Tạo Staff User
    const staffPassword = await bcrypt.hash('Staff@123456', 10);
    const staff = await this.userRepo.save({
      id: uuidv4(),
      companyId: company.id,
      email: 'staff@livemove.com',
      passwordHash: staffPassword,
      fullName: 'Nhân viên Livemove',
      phone: '0902222222',
      role: UserRole.STAFF,
      isActive: true,
    });
    console.log('✅ Staff user created:', staff.id);

    // 4. Tạo Customer User
    const customerPassword = await bcrypt.hash('Customer@123456', 10);
    const customer = await this.userRepo.save({
      id: uuidv4(),
      companyId: company.id,
      email: 'customer@livemove.com',
      passwordHash: customerPassword,
      fullName: 'Khách hàng Test',
      phone: '0903333333',
      role: UserRole.RECEIVER,
      isActive: true,
    });
    console.log('✅ Customer user created:', customer.id);

    // 5. Tạo Driver
    const driverPassword = await bcrypt.hash('Driver@123456', 10);
    const driver = await this.driverRepo.save({
      id: uuidv4(),
      companyId: company.id,
      fullName: 'Nguyễn Văn A',
      phone: '0912345678',
      passwordHash: driverPassword,
      licensePlate: '59A-12345',
      vehicleType: 'motorcycle',
      isActive: true,
      isOnline: false,
      lastLat: 10.7769,
      lastLng: 106.6966,
    });
    console.log('✅ Driver created:', driver.id);

    // 6. Tạo Driver thứ 2
    const driver2 = await this.driverRepo.save({
      id: uuidv4(),
      companyId: company.id,
      fullName: 'Trần Văn B',
      phone: '0987654321',
      passwordHash: driverPassword,
      licensePlate: '59A-54321',
      vehicleType: 'car',
      isActive: true,
      isOnline: false,
      lastLat: 10.7751,
      lastLng: 106.7015,
    });
    console.log('✅ Driver 2 created:', driver2.id);

    console.log('✅ Test data seeded successfully!');
    console.log('\n📋 Test Credentials:');
    console.log('Admin: admin@livemove.com / Admin@123456');
    console.log('Staff: staff@livemove.com / Staff@123456');
    console.log('Customer: customer@livemove.com / Customer@123456');
    console.log('Driver 1: 0912345678 / Driver@123456');
    console.log('Driver 2: 0987654321 / Driver@123456');
  }
}
