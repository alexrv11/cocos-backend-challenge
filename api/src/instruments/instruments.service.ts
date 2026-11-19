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

  async search(query: string) {
    const instruments = await this.instrumentRepo
      .createQueryBuilder('i')
      .where('i.ticker ILIKE :q OR i.name ILIKE :q', { q: `%${query}%` })
      .getMany();

    const results = await Promise.all(
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

    return results;
  }

  async getLatestMarketData(instrumentId: number): Promise<MarketData | null> {
    return this.marketDataRepo.findOne({
      where: { instrumentId },
      order: { date: 'DESC' },
    });
  }
}
