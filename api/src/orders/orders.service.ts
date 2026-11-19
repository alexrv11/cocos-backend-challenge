import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Order } from './order.entity.js';
import { MarketData } from '../marketdata/marketdata.entity.js';
import { CreateOrderDto } from './dto/create-order.dto.js';
import { OrderStatus } from '../common/enums/order-status.enum.js';
import { OrderType } from '../common/enums/order-type.enum.js';

@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(Order)
    private readonly orderRepo: Repository<Order>,
    @InjectRepository(MarketData)
    private readonly marketDataRepo: Repository<MarketData>,
  ) {}

  async create(dto: CreateOrderDto): Promise<Order> {
    if (dto.quantity && dto.totalAmount) {
      throw new BadRequestException('quantity and totalAmount are mutually exclusive');
    }
    if (!dto.quantity && !dto.totalAmount) {
      throw new BadRequestException('Either quantity or totalAmount must be provided');
    }

    if (dto.type === OrderType.MARKET) {
      return this.createMarketOrder(dto);
    }
    return this.createLimitOrder(dto);
  }

  private async createMarketOrder(dto: CreateOrderDto): Promise<Order> {
    const marketData = await this.getLatestMarketData(dto.instrumentId);
    if (!marketData) {
      throw new BadRequestException('No market data available for this instrument');
    }

    const price = Number(marketData.close);
    const size = dto.quantity ?? Math.floor(dto.totalAmount! / price);

    if (size <= 0) {
      throw new BadRequestException('Insufficient totalAmount for at least 1 share at current price');
    }

    const order = this.orderRepo.create({
      userId: dto.userId,
      instrumentId: dto.instrumentId,
      side: dto.side,
      type: dto.type,
      price,
      size,
      status: OrderStatus.FILLED,
      datetime: new Date(),
    });

    return this.orderRepo.save(order);
  }

  private async createLimitOrder(dto: CreateOrderDto): Promise<Order> {
    const size = dto.quantity ?? Math.floor(dto.totalAmount! / dto.price);

    if (size <= 0) {
      throw new BadRequestException('Insufficient totalAmount for at least 1 share at given price');
    }

    const order = this.orderRepo.create({
      userId: dto.userId,
      instrumentId: dto.instrumentId,
      side: dto.side,
      type: dto.type,
      price: dto.price,
      size,
      status: OrderStatus.NEW,
      datetime: new Date(),
    });

    return this.orderRepo.save(order);
  }

  private async getLatestMarketData(instrumentId: number): Promise<MarketData | null> {
    return this.marketDataRepo.findOne({
      where: { instrumentId },
      order: { date: 'DESC' },
    });
  }
}
