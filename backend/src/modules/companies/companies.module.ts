import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Company } from '../../database/entities/company.entity';
import { CompaniesService } from './companies.service';
import { CompaniesController } from './companies.controller';
import { SeedController } from './seed.controller';
import { UsersModule } from '../users/users.module';
import { AuthModule } from '../auth/auth.module';
import { forwardRef } from '@nestjs/common';

@Module({
  imports: [
    TypeOrmModule.forFeature([Company]),
    UsersModule,
    forwardRef(() => AuthModule),
  ],
  controllers: [CompaniesController, SeedController],
  providers: [CompaniesService],
  exports: [CompaniesService],
})
export class CompaniesModule {}
