import { IsEnum, IsInt, IsNumber, IsOptional, IsPositive, IsString, ValidateIf } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { OrderSide } from '../../common/enums/order-side.enum.js';
import { OrderType } from '../../common/enums/order-type.enum.js';

export class CreateOrderDto {
  @ApiPropertyOptional({ description: 'Client-generated key to prevent duplicate orders', example: 'order-abc-123' })
  @IsOptional()
  @IsString()
  idempotencyKey?: string;

  @ApiProperty({ example: 1 })
  @IsInt()
  userId: number;

  @ApiProperty({ example: 31 })
  @IsInt()
  instrumentId: number;

  @ApiProperty({ enum: OrderSide, example: OrderSide.BUY })
  @IsEnum(OrderSide, { message: 'side must be BUY or SELL' })
  side: OrderSide;

  @ApiProperty({ enum: OrderType, example: OrderType.MARKET })
  @IsEnum(OrderType, { message: 'type must be MARKET or LIMIT' })
  type: OrderType;

  @ApiPropertyOptional({ description: 'Number of shares (mutually exclusive with totalAmount)', example: 10 })
  @IsOptional()
  @IsInt()
  @IsPositive()
  quantity?: number;

  @ApiPropertyOptional({ description: 'Total amount in ARS (mutually exclusive with quantity)', example: 50000 })
  @IsOptional()
  @IsNumber()
  @IsPositive()
  totalAmount?: number;

  @ApiPropertyOptional({ description: 'Required for LIMIT orders', example: 950.5 })
  @ValidateIf((o) => o.type === OrderType.LIMIT)
  @IsNumber()
  @IsPositive()
  price: number;
}
