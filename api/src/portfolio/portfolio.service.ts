import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Order } from '../orders/order.entity.js';
import { MarketData } from '../marketdata/marketdata.entity.js';
import { Instrument } from '../instruments/instrument.entity.js';
import { OrderStatus } from '../common/enums/order-status.enum.js';

@Injectable()
export class PortfolioService {
  constructor(
    @InjectRepository(Order)
    private readonly orderRepo: Repository<Order>,
    @InjectRepository(MarketData)
    private readonly marketDataRepo: Repository<MarketData>,
    @InjectRepository(Instrument)
    private readonly instrumentRepo: Repository<Instrument>,
  ) {}

  async getPortfolio(userId: number) {
    const [availableCash, positions] = await Promise.all([
      this.getAvailableCash(userId),
      this.getPositions(userId),
    ]);

    const totalAccountValue = availableCash + positions.reduce((sum, p) => sum + p.totalValue, 0);

    return {
      totalAccountValue,
      availableCash,
      positions,
    };
  }

  private async getAvailableCash(userId: number): Promise<number> {
    const result = await this.orderRepo
      .createQueryBuilder('o')
      .select(`
        COALESCE(SUM(CASE WHEN o.side = 'CASH_IN' THEN o.size * o.price ELSE 0 END), 0)
        - COALESCE(SUM(CASE WHEN o.side = 'CASH_OUT' THEN o.size * o.price ELSE 0 END), 0)
        - COALESCE(SUM(CASE WHEN o.side = 'BUY' THEN o.size * o.price ELSE 0 END), 0)
        + COALESCE(SUM(CASE WHEN o.side = 'SELL' THEN o.size * o.price ELSE 0 END), 0)
      `, 'cash')
      .where('o.userId = :userId', { userId })
      .andWhere('o.status = :status', { status: OrderStatus.FILLED })
      .getRawOne();

    return Number(result?.cash ?? 0);
  }

  private async getPositions(userId: number) {
    const rows = await this.orderRepo
      .createQueryBuilder('o')
      .select('o.instrumentId', 'instrumentId')
      .addSelect(`
        SUM(CASE WHEN o.side = 'BUY' THEN o.size ELSE 0 END)
        - SUM(CASE WHEN o.side = 'SELL' THEN o.size ELSE 0 END)
      `, 'shares')
      .addSelect(`
        SUM(CASE WHEN o.side = 'BUY' THEN o.size * o.price ELSE 0 END)
        - SUM(CASE WHEN o.side = 'SELL' THEN o.size * o.price ELSE 0 END)
      `, 'costBasis')
      .innerJoin(Instrument, 'i', 'i.id = o.instrumentId')
      .where('o.userId = :userId', { userId })
      .andWhere('o.status = :status', { status: OrderStatus.FILLED })
      .andWhere("o.side IN ('BUY', 'SELL')")
      .groupBy('o.instrumentId')
      .having(`
        SUM(CASE WHEN o.side = 'BUY' THEN o.size ELSE 0 END)
        - SUM(CASE WHEN o.side = 'SELL' THEN o.size ELSE 0 END) > 0
      `)
      .getRawMany();

    if (rows.length === 0) return [];

    const instrumentIds = rows.map((r) => Number(r.instrumentId));

    const [instruments, marketDataEntries] = await Promise.all([
      this.instrumentRepo
        .createQueryBuilder('i')
        .where('i.id IN (:...ids)', { ids: instrumentIds })
        .getMany(),
      this.marketDataRepo
        .createQueryBuilder('md')
        .distinctOn(['md.instrumentId'])
        .where('md.instrumentId IN (:...ids)', { ids: instrumentIds })
        .orderBy('md.instrumentId')
        .addOrderBy('md.date', 'DESC')
        .getMany(),
    ]);

    const instrumentMap = new Map(instruments.map((i) => [i.id, i]));
    const mdMap = new Map(marketDataEntries.map((md) => [md.instrumentId, md]));

    return rows.map((row) => {
      const instrumentId = Number(row.instrumentId);
      const shares = Number(row.shares);
      const costBasis = Number(row.costBasis);
      const instrument = instrumentMap.get(instrumentId);
      const md = mdMap.get(instrumentId);
      const lastPrice = md ? Number(md.close) : 0;
      const totalValue = shares * lastPrice;
      const returnPercentage = costBasis > 0
        ? Number((((totalValue - costBasis) / costBasis) * 100).toFixed(2))
        : 0;

      return {
        instrumentId,
        ticker: instrument?.ticker ?? '',
        name: instrument?.name ?? '',
        quantity: shares,
        lastPrice,
        totalValue,
        returnPercentage,
      };
    });
  }
}
