import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { DriversService } from '../drivers/drivers.service';
import * as bcrypt from 'bcrypt';
import { UserRole } from '../../database/entities/user.entity';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private driversService: DriversService,
    private jwtService: JwtService,
  ) {}

  async validateUser(email: string, pass: string): Promise<any> {
    console.log(`[Auth] Validating user: ${email}`);
    const user = await this.usersService.findByEmail(email);
    
    if (!user) {
      console.log(`[Auth] User not found: ${email}`);
      return null;
    }

    const isMatch = await bcrypt.compare(pass, user.passwordHash);
    console.log(`[Auth] Password match for ${email}: ${isMatch}`);

    if (isMatch) {
      const { passwordHash, ...result } = user;
      return result;
    }
    
    return null;
  }

  async validateDriver(phone: string, pass: string): Promise<any> {
    console.log(`[Auth] Validating driver: ${phone}`);
    const driver = await this.driversService.findByPhone(phone);
    if (!driver) {
        console.log(`[Auth] Driver not found: ${phone}`);
        return null;
    }

    const isMatch = await bcrypt.compare(pass, driver.passwordHash);
    console.log(`[Auth] Password match for driver ${phone}: ${isMatch}`);

    if (isMatch) {
      const { passwordHash, ...result } = driver;
      return result;
    }

    return null;
  }

  async login(user: any) {
    const payload = { 
      email: user.email || user.phone, 
      sub: user.id, 
      role: user.role || 'DRIVER', 
      companyId: user.companyId,
      phone: user.phone 
    };
    return {
      user: { ...user, role: payload.role },
      access_token: this.jwtService.sign(payload),
      refresh_token: this.jwtService.sign(payload, { expiresIn: '7d' }),
    };
  }

  async refreshToken(refreshToken: string) {
    try {
      const payload = this.jwtService.verify(refreshToken);
      const newPayload = { 
        email: payload.email, 
        sub: payload.sub, 
        role: payload.role, 
        companyId: payload.companyId,
        phone: payload.phone
      };
      return {
        access_token: this.jwtService.sign(newPayload),
        refresh_token: this.jwtService.sign(newPayload, { expiresIn: '7d' }),
      };
    } catch (e) {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, 10);
  }
}
