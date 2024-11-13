import { Injectable } from '@nestjs/common';
import { Index } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class IndexService {
  constructor(private readonly prisma: PrismaService) {}

  async list(): Promise<Index[]> {
    return await this.prisma.index.findMany();
  }
}
