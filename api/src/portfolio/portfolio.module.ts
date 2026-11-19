import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Order } from '../orders/order.entity.js';
import { MarketData } from '../marketdata/marketdata.entity.js';
import { Instrument } from '../instruments/instrument.entity.js';
import { PortfolioService } from './portfolio.service.js';
import { PortfolioController } from './portfolio.controller.js';

@Module({
  imports: [TypeOrmModule.forFeature([Order, MarketData, Instrument])],
  controllers: [PortfolioController],
  providers: [PortfolioService],
})
export class PortfolioModule {}
