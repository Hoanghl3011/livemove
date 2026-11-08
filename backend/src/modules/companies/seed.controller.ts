import { Controller, Post, Body } from '@nestjs/common';
import { CompaniesService } from '../companies/companies.service';
import { UsersService } from '../users/users.service';
import { AuthService } from '../auth/auth.service';
import { UserRole } from '../../database/entities/user.entity';

@Controller('seed')
export class SeedController {
  constructor(
    private companiesService: CompaniesService,
    private usersService: UsersService,
    private authService: AuthService,
  ) {}

  @Post('init')
  async init(@Body() body: any) {
    const email = body.email || 'admin@livemove.com';
    const existingUser = await this.usersService.findByEmail(email);
    const passwordHash = await this.authService.hashPassword(body.password || 'admin123');
    
    if (existingUser) {
      // Cập nhật lại mật khẩu mới để đảm bảo User có thể đăng nhập được sau khi re-seed
      await this.usersService.update(existingUser.id, { passwordHash });
      return {
        message: 'System already initialized. Password updated.',
        admin: {
          id: existingUser.id,
          email: existingUser.email,
          role: existingUser.role,
        },
      };
    }

    // 1. Create Company
    const company = await this.companiesService.create({
      name: body.companyName || 'Livemove Inc',
      phone: body.companyPhone || '0123456789',
    });

    // 2. Create Admin User
    const admin = await this.usersService.create({
      email,
      passwordHash,
      fullName: body.fullName || 'System Admin',
      role: UserRole.ADMIN,
      companyId: company.id,
    });

    return {
      message: 'System initialized successfully',
      company,
      admin: {
        id: admin.id,
        email: admin.email,
        role: admin.role,
      },
    };
  }
}
