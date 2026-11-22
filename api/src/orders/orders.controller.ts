import { Body, Controller, Param, ParseIntPipe, Patch, Post, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard.js';
import { CurrentUser } from '../auth/current-user.decorator.js';
import { OrdersService } from './orders.service.js';
import { CreateOrderDto } from './dto/create-order.dto.js';

@ApiTags('Orders')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('api/orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post()
  @ApiOperation({ summary: 'Submit a new order (MARKET or LIMIT)' })
  @ApiResponse({ status: 201, description: 'Order created (FILLED, NEW, or REJECTED)' })
  @ApiResponse({ status: 401, description: 'Unauthorized – missing or invalid JWT' })
  create(
    @CurrentUser() user: { userId: number; email: string },
    @Body() dto: CreateOrderDto,
  ) {
    return this.ordersService.create(user.userId, dto);
  }

  @Patch(':orderId/cancel')
  @ApiOperation({ summary: 'Cancel a NEW order' })
  @ApiResponse({ status: 200, description: 'Order cancelled' })
  @ApiResponse({ status: 401, description: 'Unauthorized – missing or invalid JWT' })
  @ApiResponse({ status: 404, description: 'Order not found' })
  cancel(@Param('orderId', ParseIntPipe) orderId: number) {
    return this.ordersService.cancel(orderId);
  }
}
