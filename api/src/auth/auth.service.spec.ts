import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { getToken } from '@willsoto/nestjs-prometheus';
import { JwtService } from '@nestjs/jwt';
import { ConflictException, UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { AuthService } from './auth.service.js';
import { User } from '../users/user.entity.js';

vi.mock('bcrypt', () => ({
  hash: vi.fn(),
  compare: vi.fn(),
}));

const mockCounter = { inc: vi.fn() };

describe('AuthService', () => {
  let service: AuthService;

  const mockUserRepo = {
    findOne: vi.fn(),
    create: vi.fn((entity: Partial<User>) => entity),
    save: vi.fn((entity: Partial<User>) => Promise.resolve({ id: 1, ...entity })),
  };

  const mockJwtService = {
    sign: vi.fn().mockReturnValue('mock-jwt-token'),
  };

  beforeEach(async () => {
    vi.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: getRepositoryToken(User), useValue: mockUserRepo },
        { provide: JwtService, useValue: mockJwtService },
        { provide: getToken('auth_login_total'), useValue: mockCounter },
        { provide: getToken('auth_register_total'), useValue: mockCounter },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  // =========================================================================
  // Register
  // =========================================================================

  describe('register', () => {
    it('should register a new user and return accessToken + user info', async () => {
      mockUserRepo.findOne.mockResolvedValue(null);
      vi.mocked(bcrypt.hash).mockResolvedValue('hashed-password' as never);

      const result = await service.register({ email: 'new@cocos.com', password: 'secret123' });

      expect(result.accessToken).toBe('mock-jwt-token');
      expect(result.user.email).toBe('new@cocos.com');
      expect(result.user.accountNumber).toMatch(/^ACC-\d{8}-[0-9A-F]{4}$/);
      expect(mockUserRepo.save).toHaveBeenCalledWith(
        expect.objectContaining({ email: 'new@cocos.com', password: 'hashed-password' }),
      );
      expect(mockJwtService.sign).toHaveBeenCalledWith(
        expect.objectContaining({ sub: 1, email: 'new@cocos.com' }),
      );
    });

    it('should throw ConflictException if email already registered', async () => {
      mockUserRepo.findOne.mockResolvedValue({ id: 1, email: 'dup@cocos.com' });

      await expect(
        service.register({ email: 'dup@cocos.com', password: 'secret123' }),
      ).rejects.toThrow(ConflictException);
    });

    it('should hash the password with bcrypt salt rounds 10', async () => {
      mockUserRepo.findOne.mockResolvedValue(null);
      vi.mocked(bcrypt.hash).mockResolvedValue('hashed' as never);

      await service.register({ email: 'a@b.com', password: 'mypassword' });

      expect(bcrypt.hash).toHaveBeenCalledWith('mypassword', 10);
    });
  });

  // =========================================================================
  // Login
  // =========================================================================

  describe('login', () => {
    const storedUser = {
      id: 5,
      email: 'user@cocos.com',
      password: 'hashed-password',
      accountNumber: 'ACC-20240101-AB12',
    };

    it('should return accessToken + user info on valid credentials', async () => {
      mockUserRepo.findOne.mockResolvedValue(storedUser);
      vi.mocked(bcrypt.compare).mockResolvedValue(true as never);

      const result = await service.login({ email: 'user@cocos.com', password: 'correct' });

      expect(result.accessToken).toBe('mock-jwt-token');
      expect(result.user).toEqual({
        id: 5,
        email: 'user@cocos.com',
        accountNumber: 'ACC-20240101-AB12',
      });
      expect(mockJwtService.sign).toHaveBeenCalledWith({ sub: 5, email: 'user@cocos.com' });
    });

    it('should throw UnauthorizedException if user not found', async () => {
      mockUserRepo.findOne.mockResolvedValue(null);

      await expect(
        service.login({ email: 'nobody@cocos.com', password: 'pass' }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException if password is wrong', async () => {
      mockUserRepo.findOne.mockResolvedValue(storedUser);
      vi.mocked(bcrypt.compare).mockResolvedValue(false as never);

      await expect(
        service.login({ email: 'user@cocos.com', password: 'wrong' }),
      ).rejects.toThrow(UnauthorizedException);
    });
  });
});
