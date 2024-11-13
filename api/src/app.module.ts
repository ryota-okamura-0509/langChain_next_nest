import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MemoController } from './memo/memo.controller';
import { PrismaService } from './prisma/prisma.service';
import { MemoService } from './memo/memo.service';
import { ConfigService } from '@nestjs/config';
import { IndexController } from './index/index.controller';
import { IndexService } from './index/index.service';

@Module({
  imports: [],
  controllers: [AppController, MemoController, IndexController],
  providers: [AppService, PrismaService, MemoService, ConfigService, IndexService],
})
export class AppModule {}
