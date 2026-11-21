import { Body, Controller, Param, ParseIntPipe, Patch, Post } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { OrdersService } from './orders.service.js';
import { CreateOrderDto } from './dto/create-order.dto.js';

@ApiTags('Orders')
@Controller('api/orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post()
  @ApiOperation({ summary: 'Submit a new order (MARKET or LIMIT)' })
  create(@Body() dto: CreateOrderDto) {
    return this.ordersService.create(dto);
  }

  @Patch(':orderId/cancel')
  @ApiOperation({ summary: 'Cancel a NEW order' })
  cancel(@Param('orderId', ParseIntPipe) orderId: number) {
    return this.ordersService.cancel(orderId);
  }
}
