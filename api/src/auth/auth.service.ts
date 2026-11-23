import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { InjectMetric } from '@willsoto/nestjs-prometheus';
import { Counter } from 'prom-client';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from '../users/user.entity.js';
import { RegisterDto } from './dto/register.dto.js';
import { LoginDto } from './dto/login.dto.js';
import { JwtPayload } from './jwt.strategy.js';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    private readonly jwtService: JwtService,
    @InjectMetric('auth_login_total')
    private readonly loginCounter: Counter,
    @InjectMetric('auth_register_total')
    private readonly registerCounter: Counter,
  ) {}

  async register(dto: RegisterDto) {
    const existing = await this.userRepo.findOne({
      where: { email: dto.email },
    });
    if (existing) {
      this.registerCounter.inc({ result: 'failure' });
      throw new ConflictException('Email already registered');
    }

    const hashedPassword = await bcrypt.hash(dto.password, 10);
    const accountNumber = this.generateAccountNumber();

    const user = this.userRepo.create({
      email: dto.email,
      password: hashedPassword,
      accountNumber,
    });
    const saved = await this.userRepo.save(user);
    this.registerCounter.inc({ result: 'success' });

    return {
      accessToken: this.generateToken(saved),
      user: { id: saved.id, email: saved.email, accountNumber: saved.accountNumber },
    };
  }

  async login(dto: LoginDto) {
    const user = await this.userRepo.findOne({
      where: { email: dto.email },
    });
    if (!user) {
      this.loginCounter.inc({ result: 'failure' });
      throw new UnauthorizedException('Invalid credentials');
    }

    const passwordValid = await bcrypt.compare(dto.password, user.password);
    if (!passwordValid) {
      this.loginCounter.inc({ result: 'failure' });
      throw new UnauthorizedException('Invalid credentials');
    }

    this.loginCounter.inc({ result: 'success' });
    return {
      accessToken: this.generateToken(user),
      user: { id: user.id, email: user.email, accountNumber: user.accountNumber },
    };
  }

  private generateToken(user: User): string {
    const payload: JwtPayload = { sub: user.id, email: user.email };
    return this.jwtService.sign(payload);
  }

  private generateAccountNumber(): string {
    const date = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const random = Math.random().toString(16).slice(2, 6).toUpperCase();
    return `ACC-${date}-${random}`;
  }
}
