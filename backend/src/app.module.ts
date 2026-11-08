import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ThrottlerModule } from '@nestjs/throttler';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import * as entities from './database/entities';
import { RedisModule } from './redis/redis.module';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { DriversModule } from './modules/drivers/drivers.module';
import { CompaniesModule } from './modules/companies/companies.module';
import { OrdersModule } from './modules/orders/orders.module';
import { NotificationsModule } from './modules/notifications/notifications.module';
import { TrackingModule } from './modules/tracking/tracking.module';
import { DashboardModule } from './modules/dashboard/dashboard.module';
import { Company } from './database/entities/company.entity';

@Module({
  imports: [
    // ... other imports
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get<string>('DB_HOST'),
        port: configService.get<number>('DB_PORT'),
        username: configService.get<string>('DB_USERNAME'),
        password: configService.get<string>('DB_PASSWORD'),
        database: configService.get<string>('DB_DATABASE'),
        entities: Object.values(entities).filter(val => typeof val === 'function'),
        synchronize: true, // For dev only
        logging: true,
      }),
      inject: [ConfigService],
    }),
    RedisModule,
    ThrottlerModule.forRoot([{
      ttl: 60000,
      limit: 10,
    }]),
    AuthModule,
    UsersModule,
    DriversModule,
    CompaniesModule,
    OrdersModule,
    NotificationsModule,
    TrackingModule,
    DashboardModule,
  ],




  controllers: [AppController],
  providers: [AppService],
})

export class AppModule {}
