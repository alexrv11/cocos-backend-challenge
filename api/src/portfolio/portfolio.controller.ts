import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard.js';
import { CurrentUser } from '../auth/current-user.decorator.js';
import { PortfolioService } from './portfolio.service.js';

@ApiTags('Portfolio')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('api/portfolio')
export class PortfolioController {
  constructor(private readonly portfolioService: PortfolioService) {}

  @Get()
  @ApiOperation({ summary: 'Get portfolio for the authenticated user' })
  @ApiResponse({ status: 200, description: 'Portfolio with positions, cash, and total value' })
  @ApiResponse({ status: 401, description: 'Unauthorized – missing or invalid JWT' })
  getPortfolio(@CurrentUser() user: { userId: number; email: string }) {
    return this.portfolioService.getPortfolio(user.userId);
  }
}
