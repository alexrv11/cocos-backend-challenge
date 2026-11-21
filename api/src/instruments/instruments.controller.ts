import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { InstrumentsService } from './instruments.service.js';

@ApiTags('Instruments')
@Controller('api/instruments')
export class InstrumentsController {
  constructor(private readonly instrumentsService: InstrumentsService) {}

  @Get('search')
  @ApiOperation({ summary: 'Search instruments by ticker or name' })
  @ApiQuery({ name: 'q', description: 'Search query', example: 'PAMP' })
  @ApiQuery({ name: 'limit', required: false, example: 10 })
  @ApiQuery({ name: 'offset', required: false, example: 0 })
  search(
    @Query('q') query: string,
    @Query('limit') limit?: string,
    @Query('offset') offset?: string,
  ) {
    if (!query || query.trim() === '') {
      return { data: [], total: 0 };
    }
    return this.instrumentsService.search(
      query.trim(),
      limit ? parseInt(limit, 10) : undefined,
      offset ? parseInt(offset, 10) : undefined,
    );
  }
}
