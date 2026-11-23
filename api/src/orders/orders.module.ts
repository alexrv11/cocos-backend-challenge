import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { makeCounterProvider } from '@willsoto/nestjs-prometheus';
import { Order } from './order.entity.js';
import { MarketData } from '../marketdata/marketdata.entity.js';
import { OrdersService } from './orders.service.js';
import { OrdersController } from './orders.controller.js';

@Module({
  imports: [TypeOrmModule.forFeature([Order, MarketData])],
  controllers: [OrdersController],
  providers: [
    OrdersService,
    makeCounterProvider({
      name: 'orders_created_total',
      help: 'Total number of orders created',
      labelNames: ['type', 'side', 'status'],
    }),
    makeCounterProvider({
      name: 'orders_cancelled_total',
      help: 'Total number of orders cancelled',
    }),
  ],
  exports: [OrdersService],
})
export class OrdersModule {}
