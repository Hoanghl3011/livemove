import { Module, forwardRef } from '@nestjs/common';
import { TrackingGateway } from './tracking.gateway';
import { TrackingService } from './tracking.service';
import { TrackingProcessor } from './tracking.processor';
import { RedisModule } from '../../redis/redis.module';
import { BullModule } from '@nestjs/bullmq';
import { Order } from '../../database/entities/order.entity';
import { RouteSnapshot } from '../../database/entities/route-snapshot.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OrdersModule } from '../orders/orders.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Order, RouteSnapshot]),
    RedisModule,
    forwardRef(() => OrdersModule),
    AuthModule,
    BullModule.registerQueue({
      name: 'tracking',
    }),
  ],
  providers: [TrackingGateway, TrackingService, TrackingProcessor],
  exports: [TrackingService, TrackingGateway],
})
export class TrackingModule {}
