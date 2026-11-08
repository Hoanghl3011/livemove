import { Controller, Get, Query, UseGuards, Request } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { UserRole } from '../../database/entities/user.entity';

@Controller('dashboard')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN, UserRole.STAFF)
export class DashboardController {
  constructor(private dashboardService: DashboardService) {}

  @Get('overview')
  getOverview() {
    return this.dashboardService.getOverview();
  }

  @Get('orders/chart')
  getChart(@Query('period') period: string) {
    return this.dashboardService.getOrdersChart(period);
  }

  @Get('drivers/locations')
  getDriversLocations() {
    return this.dashboardService.getDriversLocations();
  }
}
