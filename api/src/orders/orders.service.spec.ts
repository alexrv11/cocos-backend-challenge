import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { getToken } from '@willsoto/nestjs-prometheus';
import { DataSource } from 'typeorm';
import { OrdersService } from './orders.service.js';
import { Order } from './order.entity.js';
import { MarketData } from '../marketdata/marketdata.entity.js';
import { CreateOrderDto } from './dto/create-order.dto.js';
import { OrderSide } from '../common/enums/order-side.enum.js';
import { OrderType } from '../common/enums/order-type.enum.js';
import { OrderStatus } from '../common/enums/order-status.enum.js';

const mockCounter = { inc: vi.fn() };

/**
 * Helper: build a chainable query-builder mock.
 * Every chained method returns the same object so calls like
 *   .select().where().andWhere().getRawOne()
 * work without additional wiring.
 */
function createQueryBuilderMock(rawResult: Record<string, unknown> = {}) {
  const qb: Record<string, ReturnType<typeof vi.fn>> = {};
  const self = () => qb; // every method returns the builder itself
  qb.select = vi.fn().mockReturnValue(self());
  qb.where = vi.fn().mockReturnValue(self());
  qb.andWhere = vi.fn().mockReturnValue(self());
  qb.getRawOne = vi.fn().mockResolvedValue(rawResult);
  return qb;
}

describe('OrdersService', () => {
  let service: OrdersService;

  // Mock repositories
  let orderRepo: {
    create: ReturnType<typeof vi.fn>;
    save: ReturnType<typeof vi.fn>;
    findOne: ReturnType<typeof vi.fn>;
    createQueryBuilder: ReturnType<typeof vi.fn>;
  };


  // Mock manager used inside transactions
  let mockManager: {
    query: ReturnType<typeof vi.fn>;
    findOne: ReturnType<typeof vi.fn>;
    create: ReturnType<typeof vi.fn>;
    save: ReturnType<typeof vi.fn>;
    createQueryBuilder: ReturnType<typeof vi.fn>;
  };

  let mockDataSource: { transaction: ReturnType<typeof vi.fn> };

  beforeEach(async () => {
    orderRepo = {
      create: vi.fn((entity) => entity),
      save: vi.fn((entity) => Promise.resolve({ id: 1, ...entity })),
      findOne: vi.fn(),
      createQueryBuilder: vi.fn(),
    };

    mockManager = {
      query: vi.fn().mockResolvedValue(undefined),
      findOne: vi.fn(),
      create: vi.fn((_Entity: unknown, entity: Record<string, unknown>) => entity),
      save: vi.fn((entity) => Promise.resolve({ id: 1, ...entity })),
      createQueryBuilder: vi.fn(),
    };

    mockDataSource = {
      transaction: vi.fn((cb: (manager: typeof mockManager) => Promise<unknown>) => cb(mockManager)),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OrdersService,
        { provide: getRepositoryToken(Order), useValue: orderRepo },
        { provide: DataSource, useValue: mockDataSource },
        { provide: getToken('orders_created_total'), useValue: mockCounter },
        { provide: getToken('orders_cancelled_total'), useValue: mockCounter },
      ],
    }).compile();

    service = module.get<OrdersService>(OrdersService);
  });

  // ------------------------------------------------------------------ helpers
  const defaultUserId = 1;

  function baseDto(overrides: Partial<CreateOrderDto> = {}): CreateOrderDto {
    return {
      instrumentId: 10,
      side: OrderSide.BUY,
      type: OrderType.MARKET,
      quantity: 5,
      price: undefined as unknown as number, // not needed for MARKET
      ...overrides,
    };
  }

  function mockCash(amount: number) {
    const qb = createQueryBuilderMock({ cash: amount });
    mockManager.createQueryBuilder.mockReturnValue(qb);
  }

  function mockShares(amount: number) {
    const qb = createQueryBuilderMock({ shares: amount });
    mockManager.createQueryBuilder.mockReturnValue(qb);
  }

  function mockMarketData(close: number) {
    mockManager.findOne.mockResolvedValue({ close, instrumentId: 10 } as Partial<MarketData>);
  }

  // ======================================================================
  // 1. MARKET BUY with sufficient cash -> FILLED with close price
  // ======================================================================
  it('should FILL a MARKET BUY order when user has sufficient cash', async () => {
    mockMarketData(100);
    mockCash(10_000); // 5 * 100 = 500 <= 10 000

    const dto = baseDto();
    const result = await service.create(defaultUserId, dto);

    expect(result.status).toBe(OrderStatus.FILLED);
    expect(result.price).toBe(100);
    expect(result.size).toBe(5);
    expect(result.type).toBe(OrderType.MARKET);
    expect(mockManager.save).toHaveBeenCalledTimes(1);
  });

  // ======================================================================
  // 2. MARKET SELL with sufficient shares -> FILLED
  // ======================================================================
  it('should FILL a MARKET SELL order when user has sufficient shares', async () => {
    mockMarketData(50);
    mockShares(10); // user owns 10, selling 5

    const dto = baseDto({ side: OrderSide.SELL, quantity: 5 });
    const result = await service.create(defaultUserId, dto);

    expect(result.status).toBe(OrderStatus.FILLED);
    expect(result.price).toBe(50);
    expect(result.size).toBe(5);
  });

  // ======================================================================
  // 3. LIMIT BUY -> NEW with user-provided price
  // ======================================================================
  it('should create a LIMIT BUY order with status NEW and user-provided price', async () => {
    mockCash(50_000);

    const dto = baseDto({
      type: OrderType.LIMIT,
      price: 75,
      quantity: 10,
    });
    const result = await service.create(defaultUserId, dto);

    expect(result.status).toBe(OrderStatus.NEW);
    expect(result.price).toBe(75);
    expect(result.size).toBe(10);
    expect(result.type).toBe(OrderType.LIMIT);
    // marketDataRepo should NOT be queried for LIMIT orders
    expect(mockManager.findOne).not.toHaveBeenCalled();
  });

  // ======================================================================
  // 4. BUY with insufficient cash -> REJECTED (order still saved)
  // ======================================================================
  it('should REJECT a MARKET BUY when user has insufficient cash and still persist the order', async () => {
    mockMarketData(100);
    mockCash(200); // needs 5 * 100 = 500, only 200 available

    const dto = baseDto({ quantity: 5 });
    const result = await service.create(defaultUserId, dto);

    expect(result.status).toBe(OrderStatus.REJECTED);
    expect(result.price).toBe(100);
    expect(result.size).toBe(5);
    expect(mockManager.save).toHaveBeenCalledTimes(1);
  });

  // ======================================================================
  // 5. SELL with insufficient shares -> REJECTED
  // ======================================================================
  it('should REJECT a MARKET SELL when user has insufficient shares', async () => {
    mockMarketData(50);
    mockShares(2); // user has 2, trying to sell 5

    const dto = baseDto({ side: OrderSide.SELL, quantity: 5 });
    const result = await service.create(defaultUserId, dto);

    expect(result.status).toBe(OrderStatus.REJECTED);
    expect(result.size).toBe(5);
    expect(mockManager.save).toHaveBeenCalledTimes(1);
  });

  // ======================================================================
  // 6. Quantity derived from totalAmount (Math.floor)
  // ======================================================================
  it('should compute size via Math.floor(totalAmount / price) for MARKET orders', async () => {
    mockMarketData(30); // close price = 30
    mockCash(100_000);

    const dto = baseDto({
      quantity: undefined,
      totalAmount: 100, // 100 / 30 = 3.33 -> floor = 3
    });
    const result = await service.create(defaultUserId, dto);

    expect(result.size).toBe(3);
    expect(result.price).toBe(30);
    expect(result.status).toBe(OrderStatus.FILLED);
  });

  it('should compute size via Math.floor(totalAmount / price) for LIMIT orders', async () => {
    mockCash(100_000);

    const dto = baseDto({
      type: OrderType.LIMIT,
      price: 7,
      quantity: undefined,
      totalAmount: 50, // 50 / 7 = 7.14 -> floor = 7
    });
    const result = await service.create(defaultUserId, dto);

    expect(result.size).toBe(7);
    expect(result.price).toBe(7);
    expect(result.status).toBe(OrderStatus.NEW);
  });

  // ======================================================================
  // 7. LIMIT order requires price — DTO validation is out of scope, but we
  //    test that the service uses dto.price for LIMIT orders.
  // ======================================================================
  it('should use dto.price (not market data) for LIMIT orders', async () => {
    mockCash(100_000);

    const dto = baseDto({
      type: OrderType.LIMIT,
      price: 42,
      quantity: 2,
    });
    const result = await service.create(defaultUserId, dto);

    expect(result.price).toBe(42);
    expect(mockManager.findOne).not.toHaveBeenCalled();
  });

  // ======================================================================
  // 8. MARKET order with no market data -> BadRequestException
  // ======================================================================
  it('should throw BadRequestException when no market data exists for a MARKET order', async () => {
    mockManager.findOne.mockResolvedValue(null);

    const dto = baseDto();
    await expect(service.create(defaultUserId, dto)).rejects.toThrow(BadRequestException);
    await expect(service.create(defaultUserId, dto)).rejects.toThrow('No market data available for this instrument');
  });

  // ======================================================================
  // 9. Cancel a NEW order -> CANCELLED
  // ======================================================================
  it('should cancel a NEW order and return it with CANCELLED status', async () => {
    const existingOrder = {
      id: 42,
      status: OrderStatus.NEW,
      userId: 1,
      instrumentId: 10,
      side: OrderSide.BUY,
      type: OrderType.LIMIT,
      price: 100,
      size: 5,
      datetime: new Date(),
    };
    orderRepo.findOne.mockResolvedValue({ ...existingOrder });
    orderRepo.save.mockImplementation((o: Order) => Promise.resolve(o));

    const result = await service.cancel(42);

    expect(result.status).toBe(OrderStatus.CANCELLED);
    expect(orderRepo.save).toHaveBeenCalledWith(
      expect.objectContaining({ id: 42, status: OrderStatus.CANCELLED }),
    );
    expect(mockManager.save).not.toHaveBeenCalled();
  });

  // ======================================================================
  // 10. Cancel a FILLED order -> BadRequestException
  // ======================================================================
  it('should throw BadRequestException when trying to cancel a FILLED order', async () => {
    orderRepo.findOne.mockResolvedValue({
      id: 7,
      status: OrderStatus.FILLED,
    });

    await expect(service.cancel(7)).rejects.toThrow(BadRequestException);
    await expect(service.cancel(7)).rejects.toThrow(/Only NEW orders can be cancelled/);
  });

  // ======================================================================
  // Edge cases
  // ======================================================================
  it('should throw BadRequestException when both quantity and totalAmount are provided', async () => {
    const dto = baseDto({ quantity: 5, totalAmount: 500 });
    await expect(service.create(defaultUserId, dto)).rejects.toThrow(BadRequestException);
    await expect(service.create(defaultUserId, dto)).rejects.toThrow('quantity and totalAmount are mutually exclusive');
  });

  it('should throw BadRequestException when neither quantity nor totalAmount is provided', async () => {
    const dto = baseDto({ quantity: undefined, totalAmount: undefined });
    await expect(service.create(defaultUserId, dto)).rejects.toThrow(BadRequestException);
    await expect(service.create(defaultUserId, dto)).rejects.toThrow('Either quantity or totalAmount must be provided');
  });

  it('should throw NotFoundException when cancelling a non-existent order', async () => {
    orderRepo.findOne.mockResolvedValue(null);
    await expect(service.cancel(999)).rejects.toThrow(NotFoundException);
  });

  it('should throw BadRequestException when totalAmount yields 0 shares for MARKET order', async () => {
    mockMarketData(200);

    const dto = baseDto({ quantity: undefined, totalAmount: 50 }); // 50 / 200 = 0.25 -> floor = 0
    await expect(service.create(defaultUserId, dto)).rejects.toThrow(BadRequestException);
    await expect(service.create(defaultUserId, dto)).rejects.toThrow('Insufficient totalAmount for at least 1 share');
  });

  it('should REJECT a LIMIT SELL order when user has insufficient shares', async () => {
    mockShares(1);

    const dto = baseDto({
      side: OrderSide.SELL,
      type: OrderType.LIMIT,
      price: 50,
      quantity: 5,
    });
    const result = await service.create(defaultUserId, dto);

    expect(result.status).toBe(OrderStatus.REJECTED);
    expect(mockManager.save).toHaveBeenCalledTimes(1);
  });
});
