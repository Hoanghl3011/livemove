import { Controller, Get, Post, Body, Patch, Param, UseGuards } from '@nestjs/common';
import { CompaniesService } from './companies.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { UserRole } from '../../database/entities/user.entity';
import { Company } from '../../database/entities/company.entity';

@Controller('companies')
@UseGuards(JwtAuthGuard, RolesGuard)
export class CompaniesController {
  constructor(private readonly companiesService: CompaniesService) {}

  @Post()
  @Roles(UserRole.ADMIN)
  create(@Body() createCompanyDto: Partial<Company>) {
    return this.companiesService.create(createCompanyDto);
  }

  @Get()
  @Roles(UserRole.ADMIN, UserRole.STAFF)
  findAll() {
    return this.companiesService.findAll();
  }

  @Get(':id')
  @Roles(UserRole.ADMIN, UserRole.STAFF)
  findOne(@Param('id') id: string) {
    return this.companiesService.findById(id);
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN)
  update(@Param('id') id: string, @Body() updateCompanyDto: Partial<Company>) {
    return this.companiesService.update(id, updateCompanyDto);
  }
}
