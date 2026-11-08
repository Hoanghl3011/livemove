import { Controller, Post, Body, UseGuards, Request, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './jwt-auth.guard';
import { RolesGuard } from './roles.guard';
import { Roles } from './roles.decorator';
import { UserRole } from '../../database/entities/user.entity';
import { UsersService } from '../users/users.service';

@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private usersService: UsersService,
  ) {}

  @Post('login')
  async login(@Body() body: any) {
    const identifier = body.email || body.phone || body.username;
    
    // 1. Try to validate as a regular user first
    let user = await this.authService.validateUser(identifier, body.password);
    
    // 2. If not found, try to validate as a driver
    if (!user) {
      user = await this.authService.validateDriver(identifier, body.password);
    }

    if (!user) {
      throw new UnauthorizedException('Thông tin đăng nhập không chính xác');
    }

    return this.authService.login(user);
  }

  @Post('driver/login')
  async driverLogin(@Body() body: any) {
    const driver = await this.authService.validateDriver(body.phone, body.password);
    if (!driver) {
      throw new UnauthorizedException('Invalid credentials');
    }
    return this.authService.login(driver);
  }

  @Post('refresh')
  async refresh(@Body() body: { refresh_token: string }) {
    if (!body.refresh_token) {
      throw new UnauthorizedException('Refresh token is required');
    }
    return this.authService.refreshToken(body.refresh_token);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Post('register')
  async register(@Body() body: any) {
    const existing = await this.usersService.findByEmail(body.email);
    if (existing) {
      throw new BadRequestException('User already exists');
    }
    const passwordHash = await this.authService.hashPassword(body.password);
    return this.usersService.create({
      ...body,
      passwordHash,
    });
  }
}
