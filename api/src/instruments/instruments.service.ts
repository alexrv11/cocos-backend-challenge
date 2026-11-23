import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Instrument } from './instrument.entity.js';
import { MarketData } from '../marketdata/marketdata.entity.js';

@Injectable()
export class InstrumentsService {
  constructor(
    @InjectRepository(Instrument)
    private readonly instrumentRepo: Repository<Instrument>,
    @InjectRepository(MarketData)
    private readonly marketDataRepo: Repository<MarketData>,
  ) {}

  async search(query?: string, limit?: number, offset?: number) {
    const qb = this.instrumentRepo.createQueryBuilder('i');

    qb.where("i.type != :excluded", { excluded: 'MONEDA' });

    if (query) {
      qb.andWhere('(i.ticker ILIKE :q OR i.name ILIKE :q)', { q: `%${query}%` });
    }

    const total = await qb.getCount();

    if (offset !== undefined) {
      qb.skip(offset);
    }
    if (limit !== undefined) {
      qb.take(limit);
    }

    const instruments = await qb.getMany();

    const data = await Promise.all(
      instruments.map(async (instrument) => {
        const md = await this.getLatestMarketData(instrument.id);
        return {
          id: instrument.id,
          ticker: instrument.ticker,
          name: instrument.name,
          type: instrument.type,
          lastPrice: md ? Number(md.close) : null,
          previousClose: md ? Number(md.previousClose) : null,
          dailyReturn: md && md.previousClose
            ? Number((((Number(md.close) - Number(md.previousClose)) / Number(md.previousClose)) * 100).toFixed(2))
            : null,
        };
      }),
    );

    return { data, total };
  }

  async getLatestMarketData(instrumentId: number): Promise<MarketData | null> {
    return this.marketDataRepo.findOne({
      where: { instrumentId },
      order: { date: 'DESC' },
    });
  }

  async getCandles(instrumentId: number) {
    const rows = await this.marketDataRepo.find({
      where: { instrumentId },
      order: { date: 'ASC' },
    });

    return rows.map((r) => ({
      time: typeof r.date === 'string' ? r.date : (r.date as Date).toISOString().slice(0, 10),
      open: Number(r.open),
      high: Number(r.high),
      low: Number(r.low),
      close: Number(r.close),
    }));
  }
}
