import { Controller, Get, Param, ParseIntPipe } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { PortfolioService } from './portfolio.service.js';

@ApiTags('Portfolio')
@Controller('api/portfolio')
export class PortfolioController {
  constructor(private readonly portfolioService: PortfolioService) {}

  @Get(':userId')
  @ApiOperation({ summary: 'Get portfolio for a user (positions, cash, total value)' })
  getPortfolio(@Param('userId', ParseIntPipe) userId: number) {
    return this.portfolioService.getPortfolio(userId);
  }
}
