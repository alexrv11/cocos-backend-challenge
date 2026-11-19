import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Instrument } from './instrument.entity.js';
import { MarketData } from '../marketdata/marketdata.entity.js';
import { InstrumentsService } from './instruments.service.js';
import { InstrumentsController } from './instruments.controller.js';

@Module({
  imports: [TypeOrmModule.forFeature([Instrument, MarketData])],
  controllers: [InstrumentsController],
  providers: [InstrumentsService],
  exports: [InstrumentsService],
})
export class InstrumentsModule {}
