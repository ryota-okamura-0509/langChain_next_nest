import { Controller, Get, Logger, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Memo } from '@prisma/client';
import { MemoService } from './memo.service';
import { query } from 'express';

@Controller('memo')
@ApiTags('Memo')
export class MemoController {
  private readonly logger = new Logger(MemoController.name);

  constructor(private readonly memoService: MemoService) {}

  @Get()
  async search(@Query('q') query?: string): Promise<Memo> {
    this.logger.log('search', { query });
    const result = await this.memoService.search(query);
    this.logger.log('search result', { result });
    return result;
  }

  @Get('/v2')
  async searchLlm(@Query('q') query?: string): Promise<{ content: string }> {
    const result = await this.memoService.searchLlm(query);
    return result;
  }

  @Get('/v3')
  async searchIndex(
    @Query('q') query?: string,
    @Query('index') index?: string,
  ): Promise<{ content: string }> {
    const result = await this.memoService.searchIndex(query, index);
    return result;
  }

  @Get('/v4')
  async searchWeb(@Query('q') query?: string): Promise<{ content: string }> {
    return await this.memoService.searchWeb(query);
  }
}
