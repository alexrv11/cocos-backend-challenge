import { Controller, Get, Query } from '@nestjs/common';
import { InstrumentsService } from './instruments.service.js';

@Controller('api/instruments')
export class InstrumentsController {
  constructor(private readonly instrumentsService: InstrumentsService) {}

  @Get('search')
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
