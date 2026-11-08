import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThanOrEqual } from 'typeorm';
import { Order, OrderStatus } from '../../database/entities/order.entity';
import { Driver } from '../../database/entities/driver.entity';
import { RedisService } from '../../redis/redis.service';

@Injectable()
export class DashboardService {
  constructor(
    @InjectRepository(Order)
    private orderRepository: Repository<Order>,
    @InjectRepository(Driver)
    private driverRepository: Repository<Driver>,
    private redisService: RedisService,
  ) {}

  async getOverview() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [totalOrders, activeDeliveries, completedToday] = await Promise.all([
      this.orderRepository.count(),
      this.orderRepository.count({ where: { status: OrderStatus.IN_TRANSIT } }),
      this.orderRepository.count({ 
        where: { 
          status: OrderStatus.DELIVERED, 
          updatedAt: MoreThanOrEqual(today) 
        } 
      }),
    ]);

    // Simple online driver count from Redis (assuming 'drivers:locations' key)
    const redis = this.redisService.getClient();
    const onlineDriversCount = await redis.zcard('drivers:locations');

    return {
      totalOrders,
      activeDeliveries,
      completedToday,
      driversOnline: onlineDriversCount,
      avgDeliveryTime: 35, // Mock value for now
      successRate: 98.5,   // Mock value for now
    };
  }

  async getOrdersChart(period: string = 'week') {
    // Simplified logic: return last 7 days of completed orders
    const data: { date: string, completed: number, active: number }[] = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      
      data.push({
        date: dateStr,
        completed: Math.floor(Math.random() * 50) + 10, // Mock data
        active: Math.floor(Math.random() * 20) + 5,
      });
    }
    return data;
  }

  async getDriversLocations() {
    const redis = this.redisService.getClient();
    // GEORADIUS with a large radius to get "all" (e.g. center of HCMC/HN with 100km)
    // Coords for HCMC: 10.8231, 106.6297
    const drivers = await redis.georadius('drivers:locations', 106.6297, 10.8231, 100, 'km', 'WITHCOORD');
    
    // Transform into a cleaner object
    return (drivers as any[]).map(d => ({
        driverId: d[0],
        longitude: parseFloat(d[1][0]),
        latitude: parseFloat(d[1][1]),
    }));
  }
}
