import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types.js';
import { OrdersController } from './../src/orders/orders.controller.js';
import { OrdersService } from './../src/orders/orders.service.js';
import { OrderStatus } from './../src/common/enums/order-status.enum.js';
import { OrderSide } from './../src/common/enums/order-side.enum.js';
import { OrderType } from './../src/common/enums/order-type.enum.js';
import { BadRequestException, NotFoundException } from '@nestjs/common';

describe('Orders (e2e)', () => {
  let app: INestApplication<App>;

  const mockOrdersService = {
    create: vi.fn(),
    cancel: vi.fn(),
  };

  beforeEach(async () => {
    vi.clearAllMocks();

    const moduleFixture: TestingModule = await Test.createTestingModule({
      controllers: [OrdersController],
      providers: [
        { provide: OrdersService, useValue: mockOrdersService },
      ],
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
  // POST /api/orders
  // ---------------------------------------------------------------------------

  describe('POST /api/orders', () => {
    it('MARKET BUY -> 201 with status FILLED', async () => {
      const dto = {
        userId: 1,
        instrumentId: 10,
        side: OrderSide.BUY,
        type: OrderType.MARKET,
        quantity: 5,
      };

      const expectedOrder = {
        id: 1,
        userId: dto.userId,
        instrumentId: dto.instrumentId,
        side: dto.side,
        type: dto.type,
        price: 150.25,
        size: 5,
        status: OrderStatus.FILLED,
        datetime: new Date().toISOString(),
      };

      mockOrdersService.create.mockResolvedValue(expectedOrder);

      const response = await request(app.getHttpServer())
        .post('/api/orders')
        .send(dto)
        .expect(201);

      expect(response.body).toEqual(expectedOrder);
      expect(mockOrdersService.create).toHaveBeenCalledWith(dto);
    });

    it('MARKET SELL -> 201 with status FILLED', async () => {
      const dto = {
        userId: 1,
        instrumentId: 10,
        side: OrderSide.SELL,
        type: OrderType.MARKET,
        quantity: 3,
      };

      const expectedOrder = {
        id: 2,
        userId: dto.userId,
        instrumentId: dto.instrumentId,
        side: dto.side,
        type: dto.type,
        price: 200.0,
        size: 3,
        status: OrderStatus.FILLED,
        datetime: new Date().toISOString(),
      };

      mockOrdersService.create.mockResolvedValue(expectedOrder);

      const response = await request(app.getHttpServer())
        .post('/api/orders')
        .send(dto)
        .expect(201);

      expect(response.body).toEqual(expectedOrder);
      expect(mockOrdersService.create).toHaveBeenCalledWith(dto);
    });

    it('LIMIT BUY -> 201 with status NEW', async () => {
      const dto = {
        userId: 1,
        instrumentId: 10,
        side: OrderSide.BUY,
        type: OrderType.LIMIT,
        quantity: 10,
        price: 100.5,
      };

      const expectedOrder = {
        id: 3,
        userId: dto.userId,
        instrumentId: dto.instrumentId,
        side: dto.side,
        type: dto.type,
        price: dto.price,
        size: 10,
        status: OrderStatus.NEW,
        datetime: new Date().toISOString(),
      };

      mockOrdersService.create.mockResolvedValue(expectedOrder);

      const response = await request(app.getHttpServer())
        .post('/api/orders')
        .send(dto)
        .expect(201);

      expect(response.body).toEqual(expectedOrder);
      expect(mockOrdersService.create).toHaveBeenCalledWith(dto);
    });

    it('insufficient funds -> 201 with status REJECTED', async () => {
      const dto = {
        userId: 1,
        instrumentId: 10,
        side: OrderSide.BUY,
        type: OrderType.MARKET,
        quantity: 1000,
      };

      const expectedOrder = {
        id: 4,
        userId: dto.userId,
        instrumentId: dto.instrumentId,
        side: dto.side,
        type: dto.type,
        price: 500.0,
        size: 1000,
        status: OrderStatus.REJECTED,
        datetime: new Date().toISOString(),
      };

      mockOrdersService.create.mockResolvedValue(expectedOrder);

      const response = await request(app.getHttpServer())
        .post('/api/orders')
        .send(dto)
        .expect(201);

      expect(response.body).toEqual(expectedOrder);
      expect(response.body.status).toBe(OrderStatus.REJECTED);
    });

    it('insufficient shares -> 201 with status REJECTED', async () => {
      const dto = {
        userId: 1,
        instrumentId: 10,
        side: OrderSide.SELL,
        type: OrderType.MARKET,
        quantity: 9999,
      };

      const expectedOrder = {
        id: 5,
        userId: dto.userId,
        instrumentId: dto.instrumentId,
        side: dto.side,
        type: dto.type,
        price: 50.0,
        size: 9999,
        status: OrderStatus.REJECTED,
        datetime: new Date().toISOString(),
      };

      mockOrdersService.create.mockResolvedValue(expectedOrder);

      const response = await request(app.getHttpServer())
        .post('/api/orders')
        .send(dto)
        .expect(201);

      expect(response.body).toEqual(expectedOrder);
      expect(response.body.status).toBe(OrderStatus.REJECTED);
    });

    // ---- Validation error cases ----

    it('missing required fields -> 400', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/orders')
        .send({})
        .expect(400);

      expect(response.body.message).toBeInstanceOf(Array);
      expect(response.body.message.length).toBeGreaterThan(0);
      expect(mockOrdersService.create).not.toHaveBeenCalled();
    });

    it('missing userId -> 400', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/orders')
        .send({
          instrumentId: 10,
          side: OrderSide.BUY,
          type: OrderType.MARKET,
          quantity: 5,
        })
        .expect(400);

      expect(response.body.message).toBeInstanceOf(Array);
      expect(mockOrdersService.create).not.toHaveBeenCalled();
    });

    it('missing instrumentId -> 400', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/orders')
        .send({
          userId: 1,
          side: OrderSide.BUY,
          type: OrderType.MARKET,
          quantity: 5,
        })
        .expect(400);

      expect(response.body.message).toBeInstanceOf(Array);
      expect(mockOrdersService.create).not.toHaveBeenCalled();
    });

    it('missing side -> 400', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/orders')
        .send({
          userId: 1,
          instrumentId: 10,
          type: OrderType.MARKET,
          quantity: 5,
        })
        .expect(400);

      expect(response.body.message).toBeInstanceOf(Array);
      expect(mockOrdersService.create).not.toHaveBeenCalled();
    });

    it('missing type -> 400', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/orders')
        .send({
          userId: 1,
          instrumentId: 10,
          side: OrderSide.BUY,
          quantity: 5,
        })
        .expect(400);

      expect(response.body.message).toBeInstanceOf(Array);
      expect(mockOrdersService.create).not.toHaveBeenCalled();
    });

    it('invalid side enum value -> 400', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/orders')
        .send({
          userId: 1,
          instrumentId: 10,
          side: 'INVALID',
          type: OrderType.MARKET,
          quantity: 5,
        })
        .expect(400);

      expect(response.body.message).toBeInstanceOf(Array);
      expect(mockOrdersService.create).not.toHaveBeenCalled();
    });

    it('invalid type enum value -> 400', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/orders')
        .send({
          userId: 1,
          instrumentId: 10,
          side: OrderSide.BUY,
          type: 'STOP_LOSS',
          quantity: 5,
        })
        .expect(400);

      expect(response.body.message).toBeInstanceOf(Array);
      expect(mockOrdersService.create).not.toHaveBeenCalled();
    });

    it('forbids non-whitelisted properties -> 400', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/orders')
        .send({
          userId: 1,
          instrumentId: 10,
          side: OrderSide.BUY,
          type: OrderType.MARKET,
          quantity: 5,
          hackerField: 'evil',
        })
        .expect(400);

      expect(response.body.message).toBeInstanceOf(Array);
      expect(response.body.message).toEqual(
        expect.arrayContaining([
          expect.stringContaining('hackerField'),
        ]),
      );
      expect(mockOrdersService.create).not.toHaveBeenCalled();
    });

    it('LIMIT order without price -> 400', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/orders')
        .send({
          userId: 1,
          instrumentId: 10,
          side: OrderSide.BUY,
          type: OrderType.LIMIT,
          quantity: 5,
        })
        .expect(400);

      expect(response.body.message).toBeInstanceOf(Array);
      expect(mockOrdersService.create).not.toHaveBeenCalled();
    });

    it('service throws BadRequestException (both quantity and totalAmount) -> 400', async () => {
      mockOrdersService.create.mockRejectedValue(
        new BadRequestException('quantity and totalAmount are mutually exclusive'),
      );

      const response = await request(app.getHttpServer())
        .post('/api/orders')
        .send({
          userId: 1,
          instrumentId: 10,
          side: OrderSide.BUY,
          type: OrderType.MARKET,
          quantity: 5,
          totalAmount: 1000,
        })
        .expect(400);

      expect(response.body.message).toBe(
        'quantity and totalAmount are mutually exclusive',
      );
    });
  });

  // ---------------------------------------------------------------------------
  // PATCH /api/orders/:orderId/cancel
  // ---------------------------------------------------------------------------

  describe('PATCH /api/orders/:orderId/cancel', () => {
    it('NEW order -> 200 with status CANCELLED', async () => {
      const cancelledOrder = {
        id: 3,
        userId: 1,
        instrumentId: 10,
        side: OrderSide.BUY,
        type: OrderType.LIMIT,
        price: 100.5,
        size: 10,
        status: OrderStatus.CANCELLED,
        datetime: new Date().toISOString(),
      };

      mockOrdersService.cancel.mockResolvedValue(cancelledOrder);

      const response = await request(app.getHttpServer())
        .patch('/api/orders/3/cancel')
        .expect(200);

      expect(response.body).toEqual(cancelledOrder);
      expect(response.body.status).toBe(OrderStatus.CANCELLED);
      expect(mockOrdersService.cancel).toHaveBeenCalledWith(3);
    });

    it('FILLED order -> 400 error', async () => {
      mockOrdersService.cancel.mockRejectedValue(
        new BadRequestException(
          'Only NEW orders can be cancelled, current status: FILLED',
        ),
      );

      const response = await request(app.getHttpServer())
        .patch('/api/orders/1/cancel')
        .expect(400);

      expect(response.body.message).toBe(
        'Only NEW orders can be cancelled, current status: FILLED',
      );
      expect(mockOrdersService.cancel).toHaveBeenCalledWith(1);
    });

    it('non-existent order -> 404', async () => {
      mockOrdersService.cancel.mockRejectedValue(
        new NotFoundException('Order not found'),
      );

      const response = await request(app.getHttpServer())
        .patch('/api/orders/999/cancel')
        .expect(404);

      expect(response.body.message).toBe('Order not found');
      expect(mockOrdersService.cancel).toHaveBeenCalledWith(999);
    });

    it('non-numeric orderId -> 400', async () => {
      const response = await request(app.getHttpServer())
        .patch('/api/orders/abc/cancel')
        .expect(400);

      expect(mockOrdersService.cancel).not.toHaveBeenCalled();
    });
  });
});
