import { Injectable, Inject, forwardRef } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Driver } from '../../database/entities/driver.entity';
import { AuthService } from '../auth/auth.service';

@Injectable()
export class DriversService {
  constructor(
    @InjectRepository(Driver)
    private driversRepository: Repository<Driver>,
    @Inject(forwardRef(() => AuthService))
    private authService: AuthService,
  ) {}

  async findByPhone(phone: string): Promise<Driver | null> {
    return this.driversRepository.findOne({
      where: { phone },
      select: ['id', 'phone', 'passwordHash', 'companyId', 'fullName', 'isActive'],
    });
  }

  async findById(id: string): Promise<Driver | null> {
    return this.driversRepository.findOne({ where: { id } });
  }


  async create(driverData: any): Promise<Driver> {
    const { password, ...data } = driverData;
    const passwordHash = await this.authService.hashPassword(password || 'driver123');
    
    const driverToCreate = {
      ...data,
      passwordHash,
    };
    const driver = this.driversRepository.create(driverToCreate as Partial<Driver>);
    return this.driversRepository.save(driver);
  }

  async findMany(companyId?: string): Promise<Driver[]> {
    if (companyId) {
      return this.driversRepository.find({ where: { companyId } });
    }
    return this.driversRepository.find();
  }

  async update(id: string, updateData: Partial<Driver>): Promise<Driver | null> {
    await this.driversRepository.update(id, updateData);
    return this.findById(id);
  }

  async remove(id: string): Promise<void> {
    await this.driversRepository.softDelete(id);
  }

  async updateStatus(id: string, isOnline: boolean): Promise<void> {
    await this.driversRepository.update(id, { isOnline });
  }
}
