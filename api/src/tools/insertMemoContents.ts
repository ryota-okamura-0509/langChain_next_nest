import { Prisma, PrismaClient, Memo } from '@prisma/client';
import * as fs from 'fs';
import { argv } from 'process';
import { PrismaVectorStore } from '@langchain/community/vectorstores/prisma';
import { OpenAIEmbeddings } from '@langchain/openai';

const prisma = new PrismaClient();

const fileName = argv[2];

async function main() {
  const readStream = fs.createReadStream(fileName, 'utf-8');
  // vector store
  const vectorStore = getVectorStore();
  readStream.on('data', async (chunk: string) => {
    const lines = chunk.split('\n');
    console.log(lines);
    await vectorStore.addModels(
      await prisma.$transaction(
        lines.map((line) => {
          console.log(line);
          return prisma.memo.create({
            data: {
              content: line,
            },
          });
        }),
      ),
    );
  });
}

function getVectorStore() {
  return PrismaVectorStore.withModel<Memo>(prisma).create(
    new OpenAIEmbeddings({
      batchSize: 512, // Default value if omitted is 512. Max is 2048
      modelName: 'text-embedding-3-small',
    }),
    {
      prisma: Prisma,
      tableName: 'Memo',
      vectorColumnName: 'vector',
      columns: {
        id: PrismaVectorStore.IdColumn,
        content: PrismaVectorStore.ContentColumn,
      },
    },
  );
}

main()
  .catch((e) => {
    throw e;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
