import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types.js';
import { AuthController } from './../src/auth/auth.controller.js';
import { AuthService } from './../src/auth/auth.service.js';
import { ConflictException, UnauthorizedException } from '@nestjs/common';

describe('Auth (e2e)', () => {
  let app: INestApplication<App>;

  const mockAuthService = {
    register: vi.fn(),
    login: vi.fn(),
  };

  beforeEach(async () => {
    vi.clearAllMocks();

    const moduleFixture: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [{ provide: AuthService, useValue: mockAuthService }],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }),
    );
    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });

  // ---------------------------------------------------------------------------
  // POST /api/auth/register
  // ---------------------------------------------------------------------------

  describe('POST /api/auth/register', () => {
    it('valid registration -> 201 with accessToken', async () => {
      const expectedResponse = {
        accessToken: 'jwt-token',
        user: { id: 1, email: 'new@cocos.com', accountNumber: 'ACC-20240101-AB12' },
      };
      mockAuthService.register.mockResolvedValue(expectedResponse);

      const response = await request(app.getHttpServer())
        .post('/api/auth/register')
        .send({ email: 'new@cocos.com', password: 'secret123' })
        .expect(201);

      expect(response.body).toEqual(expectedResponse);
      expect(mockAuthService.register).toHaveBeenCalledWith({
        email: 'new@cocos.com',
        password: 'secret123',
      });
    });

    it('duplicate email -> 409', async () => {
      mockAuthService.register.mockRejectedValue(
        new ConflictException('Email already registered'),
      );

      const response = await request(app.getHttpServer())
        .post('/api/auth/register')
        .send({ email: 'dup@cocos.com', password: 'secret123' })
        .expect(409);

      expect(response.body.message).toBe('Email already registered');
    });

    it('missing email -> 400', async () => {
      await request(app.getHttpServer())
        .post('/api/auth/register')
        .send({ password: 'secret123' })
        .expect(400);

      expect(mockAuthService.register).not.toHaveBeenCalled();
    });

    it('invalid email -> 400', async () => {
      await request(app.getHttpServer())
        .post('/api/auth/register')
        .send({ email: 'not-an-email', password: 'secret123' })
        .expect(400);

      expect(mockAuthService.register).not.toHaveBeenCalled();
    });

    it('missing password -> 400', async () => {
      await request(app.getHttpServer())
        .post('/api/auth/register')
        .send({ email: 'user@cocos.com' })
        .expect(400);

      expect(mockAuthService.register).not.toHaveBeenCalled();
    });

    it('password too short -> 400', async () => {
      await request(app.getHttpServer())
        .post('/api/auth/register')
        .send({ email: 'user@cocos.com', password: '12345' })
        .expect(400);

      expect(mockAuthService.register).not.toHaveBeenCalled();
    });

    it('forbids non-whitelisted properties -> 400', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/auth/register')
        .send({ email: 'user@cocos.com', password: 'secret123', role: 'admin' })
        .expect(400);

      expect(response.body.message).toEqual(
        expect.arrayContaining([expect.stringContaining('role')]),
      );
      expect(mockAuthService.register).not.toHaveBeenCalled();
    });
  });

  // ---------------------------------------------------------------------------
  // POST /api/auth/login
  // ---------------------------------------------------------------------------

  describe('POST /api/auth/login', () => {
    it('valid login -> 201 with accessToken', async () => {
      const expectedResponse = {
        accessToken: 'jwt-token',
        user: { id: 1, email: 'user@cocos.com', accountNumber: 'ACC-20240101-AB12' },
      };
      mockAuthService.login.mockResolvedValue(expectedResponse);

      const response = await request(app.getHttpServer())
        .post('/api/auth/login')
        .send({ email: 'user@cocos.com', password: 'secret123' })
        .expect(201);

      expect(response.body).toEqual(expectedResponse);
      expect(mockAuthService.login).toHaveBeenCalledWith({
        email: 'user@cocos.com',
        password: 'secret123',
      });
    });

    it('invalid credentials -> 401', async () => {
      mockAuthService.login.mockRejectedValue(
        new UnauthorizedException('Invalid credentials'),
      );

      const response = await request(app.getHttpServer())
        .post('/api/auth/login')
        .send({ email: 'user@cocos.com', password: 'wrong' })
        .expect(401);

      expect(response.body.message).toBe('Invalid credentials');
    });

    it('missing email -> 400', async () => {
      await request(app.getHttpServer())
        .post('/api/auth/login')
        .send({ password: 'secret123' })
        .expect(400);

      expect(mockAuthService.login).not.toHaveBeenCalled();
    });

    it('invalid email -> 400', async () => {
      await request(app.getHttpServer())
        .post('/api/auth/login')
        .send({ email: 'bad', password: 'secret123' })
        .expect(400);

      expect(mockAuthService.login).not.toHaveBeenCalled();
    });

    it('missing password -> 400', async () => {
      await request(app.getHttpServer())
        .post('/api/auth/login')
        .send({ email: 'user@cocos.com' })
        .expect(400);

      expect(mockAuthService.login).not.toHaveBeenCalled();
    });
  });
});
