import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Order } from '../../database/entities/order.entity';
import { OrdersService } from './orders.service';
import { OrdersController } from './orders.controller';
import { NotificationsModule } from '../notifications/notifications.module';
import { TrackingModule } from '../tracking/tracking.module';
import { UsersModule } from '../users/users.module';

import { BullModule } from '@nestjs/bullmq';

@Module({
  imports: [
    TypeOrmModule.forFeature([Order]),
    NotificationsModule,
    forwardRef(() => TrackingModule),
    UsersModule,
    BullModule.registerQueue({
      name: 'tracking',
    }),
  ],
  providers: [OrdersService],
  controllers: [OrdersController],
  exports: [OrdersService],
})

export class OrdersModule {}
