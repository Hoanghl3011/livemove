import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';

@Injectable()
export class RedisService implements OnModuleInit, OnModuleDestroy {
  private redisClient: Redis;

  constructor(private configService: ConfigService) {}

  onModuleInit() {
    this.redisClient = new Redis({
      host: this.configService.get<string>('REDIS_HOST'),
      port: this.configService.get<number>('REDIS_PORT'),
    });
  }

  onModuleDestroy() {
    this.redisClient.quit();
  }

  getClient(): Redis {
    return this.redisClient;
  }

  async geoAdd(key: string, lng: number, lat: number, member: string) {
    return this.redisClient.geoadd(key, lng, lat, member);
  }

  async geoPos(key: string, member: string) {
    return this.redisClient.geopos(key, member);
  }

  async geoRadius(key: string, lng: number, lat: number, radius: number, unit: 'm' | 'km' | 'ft' | 'mi' = 'km') {
    return this.redisClient.georadius(key, lng, lat, radius, unit, 'WITHCOORD', 'WITHDIST');
  }

  async zAdd(key: string, score: number, value: string) {
    return this.redisClient.zadd(key, score, value);
  }

  async zRangeByScore(key: string, min: string | number, max: string | number) {
    return this.redisClient.zrangebyscore(key, min, max);
  }

  async hSet(key: string, field: string, value: string) {
    return this.redisClient.hset(key, field, value);
  }

  async hGet(key: string, field: string) {
    return this.redisClient.hget(key, field);
  }

  async hDel(key: string, field: string) {
    return this.redisClient.hdel(key, field);
  }

  async publish(channel: string, message: string) {
    return this.redisClient.publish(channel, message);
  }

  async set(key: string, value: string, ttlSeconds?: number) {
    if (ttlSeconds) {
      return this.redisClient.set(key, value, 'EX', ttlSeconds);
    }
    return this.redisClient.set(key, value);
  }

  async get(key: string) {
    return this.redisClient.get(key);
  }

  async del(key: string) {
    return this.redisClient.del(key);
  }
}
