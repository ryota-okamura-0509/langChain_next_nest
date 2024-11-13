import { Controller, Get } from '@nestjs/common';
import { IndexService } from './index.service';
import { Index } from '@prisma/client';

@Controller('index')
export class IndexController {
  constructor(private readonly indexService: IndexService) {}
  @Get()
  async list(): Promise<Index[]> {
    const indexList = await this.indexService.list();
    console.log(indexList[0]);
    return indexList;
  }
}
