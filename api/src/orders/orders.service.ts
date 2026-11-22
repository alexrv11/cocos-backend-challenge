import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, EntityManager, Repository } from 'typeorm';
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
    private readonly dataSource: DataSource,
  ) {}

  async create(userId: number, dto: CreateOrderDto): Promise<Order> {
    if (dto.quantity && dto.totalAmount) {
      throw new BadRequestException('quantity and totalAmount are mutually exclusive');
    }
    if (!dto.quantity && !dto.totalAmount) {
      throw new BadRequestException('Either quantity or totalAmount must be provided');
    }

    return this.dataSource.transaction(async (manager) => {
      // Idempotency check: return existing order if key was already processed
      if (dto.idempotencyKey) {
        const existing = await manager.findOne(Order, {
          where: { idempotencyKey: dto.idempotencyKey },
        });
        if (existing) {
          return existing;
        }
      }

      // Advisory lock on userId to serialize concurrent orders per user
      await manager.query('SELECT pg_advisory_xact_lock($1)', [userId]);

      if (dto.type === OrderType.MARKET) {
        return this.createMarketOrder(userId, dto, manager);
      }
      return this.createLimitOrder(userId, dto, manager);
    });
  }

  private async createMarketOrder(userId: number, dto: CreateOrderDto, manager: EntityManager): Promise<Order> {
    const marketData = await manager.findOne(MarketData, {
      where: { instrumentId: dto.instrumentId },
      order: { date: 'DESC' },
    });
    if (!marketData) {
      throw new BadRequestException('No market data available for this instrument');
    }

    const price = Number(marketData.close);
    const size = dto.quantity ?? Math.floor(dto.totalAmount! / price);

    if (size <= 0) {
      throw new BadRequestException('Insufficient totalAmount for at least 1 share at current price');
    }

    const status = await this.validateOrder(userId, dto, price, size, manager);

    const order = manager.create(Order, {
      userId,
      instrumentId: dto.instrumentId,
      side: dto.side,
      type: dto.type,
      price,
      size,
      status,
      idempotencyKey: dto.idempotencyKey ?? null,
      datetime: new Date(),
    });

    return manager.save(order);
  }

  private async createLimitOrder(userId: number, dto: CreateOrderDto, manager: EntityManager): Promise<Order> {
    const size = dto.quantity ?? Math.floor(dto.totalAmount! / dto.price);

    if (size <= 0) {
      throw new BadRequestException('Insufficient totalAmount for at least 1 share at given price');
    }

    const status = await this.validateOrder(userId, dto, dto.price, size, manager);

    const order = manager.create(Order, {
      userId,
      instrumentId: dto.instrumentId,
      side: dto.side,
      type: dto.type,
      price: dto.price,
      size,
      status: status === OrderStatus.FILLED ? OrderStatus.NEW : status,
      idempotencyKey: dto.idempotencyKey ?? null,
      datetime: new Date(),
    });

    return manager.save(order);
  }

  private async validateOrder(userId: number, dto: CreateOrderDto, price: number, size: number, manager: EntityManager): Promise<OrderStatus> {
    if (dto.side === OrderSide.BUY) {
      const availableCash = await this.getAvailableCash(userId, manager);
      const orderCost = size * price;
      if (orderCost > availableCash) {
        return OrderStatus.REJECTED;
      }
    } else if (dto.side === OrderSide.SELL) {
      const availableShares = await this.getAvailableShares(userId, dto.instrumentId, manager);
      if (size > availableShares) {
        return OrderStatus.REJECTED;
      }
    }
    return OrderStatus.FILLED;
  }

  private async getAvailableCash(userId: number, manager: EntityManager): Promise<number> {
    const result = await manager
      .createQueryBuilder(Order, 'o')
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

  private async getAvailableShares(userId: number, instrumentId: number, manager: EntityManager): Promise<number> {
    const result = await manager
      .createQueryBuilder(Order, 'o')
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
}
