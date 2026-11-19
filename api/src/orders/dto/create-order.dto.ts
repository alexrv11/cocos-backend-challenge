import { IsEnum, IsInt, IsNumber, IsOptional, IsPositive, ValidateIf } from 'class-validator';
import { OrderSide } from '../../common/enums/order-side.enum.js';
import { OrderType } from '../../common/enums/order-type.enum.js';

export class CreateOrderDto {
  @IsInt()
  userId: number;

  @IsInt()
  instrumentId: number;

  @IsEnum(OrderSide, { message: 'side must be BUY or SELL' })
  side: OrderSide;

  @IsEnum(OrderType, { message: 'type must be MARKET or LIMIT' })
  type: OrderType;

  @IsOptional()
  @IsInt()
  @IsPositive()
  quantity?: number;

  @IsOptional()
  @IsNumber()
  @IsPositive()
  totalAmount?: number;

  @ValidateIf((o) => o.type === OrderType.LIMIT)
  @IsNumber()
  @IsPositive()
  price: number;
}
