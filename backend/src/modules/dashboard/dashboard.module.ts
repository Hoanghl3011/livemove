import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DashboardController } from './dashboard.controller';
import { DashboardService } from './dashboard.service';
import { Order } from '../../database/entities/order.entity';
import { Driver } from '../../database/entities/driver.entity';
import { RedisModule } from '../../redis/redis.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Order, Driver]),
    RedisModule,
  ],
  controllers: [DashboardController],
  providers: [DashboardService],
})
export class DashboardModule {}
