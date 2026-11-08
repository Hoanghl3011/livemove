import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Driver } from '../../database/entities/driver.entity';
import { DriversService } from './drivers.service';
import { DriversController } from './drivers.controller';
import { RedisModule } from '../../redis/redis.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Driver]),
    RedisModule,
    forwardRef(() => AuthModule),
  ],
  controllers: [DriversController],
  providers: [DriversService],
  exports: [DriversService],
})
export class DriversModule {}
