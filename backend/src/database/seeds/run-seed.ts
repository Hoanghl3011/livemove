import { NestFactory } from '@nestjs/core';
import { AppModule } from '../../app.module';
import { TestDataSeed } from './test-data.seed';
import { DataSource } from 'typeorm';
import { Company } from '../entities/company.entity';
import { User } from '../entities/user.entity';
import { Driver } from '../entities/driver.entity';

async function bootstrap() {
  console.log('🚀 Setting up NestJS Application Context for Seeding...');
  const app = await NestFactory.createApplicationContext(AppModule);
  const dataSource = app.get(DataSource);
  
  console.log('🧹 Dropping existing database schema to ensure clean slate...');
  await dataSource.dropDatabase();
  console.log('🏗️ Synchronizing schema...');
  await dataSource.synchronize();

  console.log('⏳ Running TestDataSeed...');
  const seedService = new TestDataSeed(
    dataSource.getRepository(Company),
    dataSource.getRepository(User),
    dataSource.getRepository(Driver)
  );

  await seedService.seed();

  console.log('✅ Seeding complete. Closing connection...');
  await app.close();
  process.exit(0);
}

bootstrap();
