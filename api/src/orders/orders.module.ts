import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Order } from './order.entity.js';
import { MarketData } from '../marketdata/marketdata.entity.js';
import { OrdersService } from './orders.service.js';
import { OrdersController } from './orders.controller.js';

@Module({
  imports: [TypeOrmModule.forFeature([Order, MarketData])],
  controllers: [OrdersController],
  providers: [OrdersService],
  exports: [OrdersService],
})
export class OrdersModule {}
