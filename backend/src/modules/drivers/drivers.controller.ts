import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Query, Req, BadRequestException } from '@nestjs/common';
import { DriversService } from './drivers.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { UserRole } from '../../database/entities/user.entity';
import { Driver } from '../../database/entities/driver.entity';
import { RedisService } from '../../redis/redis.service';

@Controller('drivers')
@UseGuards(JwtAuthGuard, RolesGuard)
export class DriversController {
  constructor(
    private readonly driversService: DriversService,
    private readonly redisService: RedisService,
  ) {}

  @Post()
  @Roles(UserRole.ADMIN)
  async create(@Body() createDriverDto: any, @Req() req: any) {
    const existing = await this.driversService.findByPhone(createDriverDto.phone);
    if (existing) {
       throw new BadRequestException('Số điện thoại hoặc Username này đã được sử dụng cho một tài xế. Vui lòng nhập số khác!');
    }
    return this.driversService.create({
      ...createDriverDto,
      companyId: req.user.companyId
    });
  }

  @Get()
  @Roles(UserRole.ADMIN, UserRole.STAFF)
  findAll(@Req() req: any) {
    return this.driversService.findMany(req.user.companyId);
  }

  @Get('nearby')
  @Roles(UserRole.ADMIN, UserRole.STAFF)
  async findNearby(
    @Query('lat') lat: number,
    @Query('lng') lng: number,
    @Query('radius') radius: number = 5,
  ) {
    const nearby = await this.redisService.geoRadius('drivers:locations', lng, lat, radius, 'km');
    return nearby;
  }

  @Get(':id')
  @Roles(UserRole.ADMIN, UserRole.STAFF, UserRole.DRIVER)
  findOne(@Param('id') id: string) {
    return this.driversService.findById(id);
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN, UserRole.DRIVER)
  update(@Param('id') id: string, @Body() updateDriverDto: Partial<Driver>) {
    return this.driversService.update(id, updateDriverDto);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN)
  remove(@Param('id') id: string) {
    return this.driversService.remove(id);
  }
}
