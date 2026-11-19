import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Order } from './order.entity.js';
import { MarketData } from '../marketdata/marketdata.entity.js';
import { CreateOrderDto } from './dto/create-order.dto.js';
import { OrderStatus } from '../common/enums/order-status.enum.js';
import { OrderType } from '../common/enums/order-type.enum.js';
import { OrderSide } from '../common/enums/order-side.enum.js';

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

    const status = await this.validateOrder(dto, price, size);

    const order = this.orderRepo.create({
      userId: dto.userId,
      instrumentId: dto.instrumentId,
      side: dto.side,
      type: dto.type,
      price,
      size,
      status,
      datetime: new Date(),
    });

    return this.orderRepo.save(order);
  }

  private async createLimitOrder(dto: CreateOrderDto): Promise<Order> {
    const size = dto.quantity ?? Math.floor(dto.totalAmount! / dto.price);

    if (size <= 0) {
      throw new BadRequestException('Insufficient totalAmount for at least 1 share at given price');
    }

    const status = await this.validateOrder(dto, dto.price, size);

    const order = this.orderRepo.create({
      userId: dto.userId,
      instrumentId: dto.instrumentId,
      side: dto.side,
      type: dto.type,
      price: dto.price,
      size,
      status: status === OrderStatus.FILLED ? OrderStatus.NEW : status,
      datetime: new Date(),
    });

    return this.orderRepo.save(order);
  }

  private async validateOrder(dto: CreateOrderDto, price: number, size: number): Promise<OrderStatus> {
    if (dto.side === OrderSide.BUY) {
      const availableCash = await this.getAvailableCash(dto.userId);
      const orderCost = size * price;
      if (orderCost > availableCash) {
        return OrderStatus.REJECTED;
      }
    } else if (dto.side === OrderSide.SELL) {
      const availableShares = await this.getAvailableShares(dto.userId, dto.instrumentId);
      if (size > availableShares) {
        return OrderStatus.REJECTED;
      }
    }
    return OrderStatus.FILLED;
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

  private async getAvailableShares(userId: number, instrumentId: number): Promise<number> {
    const result = await this.orderRepo
      .createQueryBuilder('o')
      .select(`
        COALESCE(SUM(CASE WHEN o.side = 'BUY' THEN o.size ELSE 0 END), 0)
        - COALESCE(SUM(CASE WHEN o.side = 'SELL' THEN o.size ELSE 0 END), 0)
      `, 'shares')
      .where('o.userId = :userId', { userId })
      .andWhere('o.instrumentId = :instrumentId', { instrumentId })
      .andWhere('o.status = :status', { status: OrderStatus.FILLED })
      .getRawOne();

    return Number(result?.shares ?? 0);
  }

  async cancel(orderId: number): Promise<Order> {
    const order = await this.orderRepo.findOne({ where: { id: orderId } });
    if (!order) {
      throw new NotFoundException('Order not found');
    }
    if (order.status !== OrderStatus.NEW) {
      throw new BadRequestException(`Only NEW orders can be cancelled, current status: ${order.status}`);
    }
    order.status = OrderStatus.CANCELLED;
    return this.orderRepo.save(order);
  }

  private async getLatestMarketData(instrumentId: number): Promise<MarketData | null> {
    return this.marketDataRepo.findOne({
      where: { instrumentId },
      order: { date: 'DESC' },
    });
  }
}
