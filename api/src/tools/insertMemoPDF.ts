import { PrismaClient } from '@prisma/client';
import { argv } from 'process';
import { OpenAIEmbeddings } from '@langchain/openai';
import { PDFLoader } from 'langchain/document_loaders/fs/pdf';
import { CharacterTextSplitter } from 'langchain/text_splitter';
import { HNSWLib } from '@langchain/community/vectorstores/hnswlib';

const prisma = new PrismaClient();

const fileName = argv[2];

async function main() {
  const loader = new PDFLoader(fileName, { splitPages: false });
  const textSplitter = new CharacterTextSplitter({ chunkSize: 500 });
  const docs = await loader.loadAndSplit(textSplitter);
  console.log('docs');
  const vectorStore = await HNSWLib.fromDocuments(docs, new OpenAIEmbeddings());
  await vectorStore.save('MyData');
}

main()
  .catch((e) => {
    throw e;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
