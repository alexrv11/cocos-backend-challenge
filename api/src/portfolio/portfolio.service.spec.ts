import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { PortfolioService } from './portfolio.service.js';
import { Order } from '../orders/order.entity.js';
import { MarketData } from '../marketdata/marketdata.entity.js';
import { Instrument } from '../instruments/instrument.entity.js';

// ---------------------------------------------------------------------------
// Helper: creates a chainable query-builder mock whose terminal method
// (getRawOne, getRawMany, getMany) resolves with the given value.
// ---------------------------------------------------------------------------
function createQBMock(resolvedValue: unknown, terminal: 'getRawOne' | 'getRawMany' | 'getMany' = 'getRawOne') {
  const qb: Record<string, ReturnType<typeof vi.fn>> = {};

  const chainMethods = [
    'select',
    'addSelect',
    'innerJoin',
    'where',
    'andWhere',
    'groupBy',
    'having',
    'orderBy',
    'addOrderBy',
    'distinctOn',
  ];

  for (const m of chainMethods) {
    qb[m] = vi.fn().mockReturnThis();
  }

  qb.getRawOne = vi.fn().mockResolvedValue(terminal === 'getRawOne' ? resolvedValue : undefined);
  qb.getRawMany = vi.fn().mockResolvedValue(terminal === 'getRawMany' ? resolvedValue : []);
  qb.getMany = vi.fn().mockResolvedValue(terminal === 'getMany' ? resolvedValue : []);

  return qb;
}

describe('PortfolioService', () => {
  let service: PortfolioService;

  // Mocked repos -- reassigned in each test via createTestingModule helpers
  let orderRepoMock: { createQueryBuilder: ReturnType<typeof vi.fn> };
  let marketDataRepoMock: { createQueryBuilder: ReturnType<typeof vi.fn> };
  let instrumentRepoMock: { createQueryBuilder: ReturnType<typeof vi.fn> };

  beforeEach(async () => {
    orderRepoMock = { createQueryBuilder: vi.fn() };
    marketDataRepoMock = { createQueryBuilder: vi.fn() };
    instrumentRepoMock = { createQueryBuilder: vi.fn() };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PortfolioService,
        { provide: getRepositoryToken(Order), useValue: orderRepoMock },
        { provide: getRepositoryToken(MarketData), useValue: marketDataRepoMock },
        { provide: getRepositoryToken(Instrument), useValue: instrumentRepoMock },
      ],
    }).compile();

    service = module.get<PortfolioService>(PortfolioService);
  });

  // -----------------------------------------------------------------------
  // 1. Cash calculation with mixed order types
  // -----------------------------------------------------------------------
  it('should calculate available cash from mixed CASH_IN, CASH_OUT, BUY and SELL orders', async () => {
    // cash = CASH_IN(10000) - CASH_OUT(2000) - BUY(3000) + SELL(500) = 5500
    const cashQB = createQBMock({ cash: '5500' }, 'getRawOne');
    const positionsQB = createQBMock([], 'getRawMany');

    orderRepoMock.createQueryBuilder
      .mockReturnValueOnce(cashQB)   // getAvailableCash
      .mockReturnValueOnce(positionsQB); // getPositions

    const result = await service.getPortfolio(1);

    expect(result.availableCash).toBe(5500);
    expect(result.positions).toEqual([]);
    expect(result.totalAccountValue).toBe(5500);
  });

  // -----------------------------------------------------------------------
  // 2. Position aggregation (net shares from BUY - SELL)
  // -----------------------------------------------------------------------
  it('should aggregate positions correctly (net shares = BUY - SELL)', async () => {
    const cashQB = createQBMock({ cash: '1000' }, 'getRawOne');

    // Two instruments: id 10 (net 5 shares), id 20 (net 3 shares)
    const positionsQB = createQBMock(
      [
        { instrumentId: '10', shares: '5', costBasis: '500' },
        { instrumentId: '20', shares: '3', costBasis: '300' },
      ],
      'getRawMany',
    );

    orderRepoMock.createQueryBuilder
      .mockReturnValueOnce(cashQB)
      .mockReturnValueOnce(positionsQB);

    const instrumentQB = createQBMock(
      [
        { id: 10, ticker: 'AAPL', name: 'Apple Inc.', type: 'STOCK' },
        { id: 20, ticker: 'GOOG', name: 'Alphabet Inc.', type: 'STOCK' },
      ] as Instrument[],
      'getMany',
    );

    const marketDataQB = createQBMock(
      [
        { id: 1, instrumentId: 10, close: 120 } as unknown as MarketData,
        { id: 2, instrumentId: 20, close: 150 } as unknown as MarketData,
      ],
      'getMany',
    );

    instrumentRepoMock.createQueryBuilder.mockReturnValue(instrumentQB);
    marketDataRepoMock.createQueryBuilder.mockReturnValue(marketDataQB);

    const result = await service.getPortfolio(1);

    // Position for AAPL: 5 shares * 120 = 600
    expect(result.positions[0]).toEqual(
      expect.objectContaining({
        instrumentId: 10,
        ticker: 'AAPL',
        name: 'Apple Inc.',
        quantity: 5,
        lastPrice: 120,
        totalValue: 600,
      }),
    );

    // Position for GOOG: 3 shares * 150 = 450
    expect(result.positions[1]).toEqual(
      expect.objectContaining({
        instrumentId: 20,
        ticker: 'GOOG',
        name: 'Alphabet Inc.',
        quantity: 3,
        lastPrice: 150,
        totalValue: 450,
      }),
    );

    // totalAccountValue = cash(1000) + 600 + 450 = 2050
    expect(result.totalAccountValue).toBe(2050);
  });

  // -----------------------------------------------------------------------
  // 3. Return percentage calculation
  // -----------------------------------------------------------------------
  it('should calculate returnPercentage as (marketValue - costBasis) / costBasis * 100', async () => {
    const cashQB = createQBMock({ cash: '0' }, 'getRawOne');

    // costBasis = 1000, shares = 10 → avg cost 100
    const positionsQB = createQBMock(
      [{ instrumentId: '5', shares: '10', costBasis: '1000' }],
      'getRawMany',
    );

    orderRepoMock.createQueryBuilder
      .mockReturnValueOnce(cashQB)
      .mockReturnValueOnce(positionsQB);

    const instrumentQB = createQBMock(
      [{ id: 5, ticker: 'TSLA', name: 'Tesla Inc.', type: 'STOCK' }] as Instrument[],
      'getMany',
    );

    // close = 150, so totalValue = 10 * 150 = 1500
    // returnPercentage = ((1500 - 1000) / 1000) * 100 = 50
    const marketDataQB = createQBMock(
      [{ id: 1, instrumentId: 5, close: 150 } as unknown as MarketData],
      'getMany',
    );

    instrumentRepoMock.createQueryBuilder.mockReturnValue(instrumentQB);
    marketDataRepoMock.createQueryBuilder.mockReturnValue(marketDataQB);

    const result = await service.getPortfolio(1);

    expect(result.positions[0].returnPercentage).toBe(50);
    expect(result.positions[0].totalValue).toBe(1500);
  });

  it('should round returnPercentage to two decimal places', async () => {
    const cashQB = createQBMock({ cash: '0' }, 'getRawOne');

    // costBasis = 300, shares = 3 → avg cost 100
    const positionsQB = createQBMock(
      [{ instrumentId: '7', shares: '3', costBasis: '300' }],
      'getRawMany',
    );

    orderRepoMock.createQueryBuilder
      .mockReturnValueOnce(cashQB)
      .mockReturnValueOnce(positionsQB);

    const instrumentQB = createQBMock(
      [{ id: 7, ticker: 'MSFT', name: 'Microsoft Corp.', type: 'STOCK' }] as Instrument[],
      'getMany',
    );

    // close = 133 → totalValue = 399
    // returnPercentage = ((399 - 300) / 300) * 100 = 33.00
    const marketDataQB = createQBMock(
      [{ id: 1, instrumentId: 7, close: 133 } as unknown as MarketData],
      'getMany',
    );

    instrumentRepoMock.createQueryBuilder.mockReturnValue(instrumentQB);
    marketDataRepoMock.createQueryBuilder.mockReturnValue(marketDataQB);

    const result = await service.getPortfolio(1);

    expect(result.positions[0].returnPercentage).toBe(33);
  });

  // -----------------------------------------------------------------------
  // 4. Empty portfolio (no orders)
  // -----------------------------------------------------------------------
  it('should return an empty portfolio when user has no orders', async () => {
    const cashQB = createQBMock({ cash: null }, 'getRawOne');
    const positionsQB = createQBMock([], 'getRawMany');

    orderRepoMock.createQueryBuilder
      .mockReturnValueOnce(cashQB)
      .mockReturnValueOnce(positionsQB);

    const result = await service.getPortfolio(99);

    expect(result).toEqual({
      totalAccountValue: 0,
      availableCash: 0,
      positions: [],
    });
  });

  // -----------------------------------------------------------------------
  // 5. User with only CASH_IN (no positions)
  // -----------------------------------------------------------------------
  it('should return availableCash with empty positions when user only has CASH_IN orders', async () => {
    const cashQB = createQBMock({ cash: '25000' }, 'getRawOne');
    const positionsQB = createQBMock([], 'getRawMany');

    orderRepoMock.createQueryBuilder
      .mockReturnValueOnce(cashQB)
      .mockReturnValueOnce(positionsQB);

    const result = await service.getPortfolio(42);

    expect(result.availableCash).toBe(25000);
    expect(result.positions).toEqual([]);
    expect(result.totalAccountValue).toBe(25000);
  });

  // -----------------------------------------------------------------------
  // Edge: cash query returns undefined row
  // -----------------------------------------------------------------------
  it('should default to 0 cash when getRawOne returns undefined', async () => {
    const cashQB = createQBMock(undefined, 'getRawOne');
    const positionsQB = createQBMock([], 'getRawMany');

    orderRepoMock.createQueryBuilder
      .mockReturnValueOnce(cashQB)
      .mockReturnValueOnce(positionsQB);

    const result = await service.getPortfolio(1);

    expect(result.availableCash).toBe(0);
    expect(result.totalAccountValue).toBe(0);
    expect(result.positions).toEqual([]);
  });
});
