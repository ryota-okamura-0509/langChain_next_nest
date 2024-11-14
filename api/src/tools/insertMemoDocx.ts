import { PrismaClient } from '@prisma/client';
import { argv } from 'process';
import { OpenAIEmbeddings } from '@langchain/openai';
import { DocxLoader } from 'langchain/document_loaders/fs/docx';
import { RecursiveCharacterTextSplitter } from 'langchain/text_splitter';
import { HNSWLib } from '@langchain/community/vectorstores/hnswlib';

const prisma = new PrismaClient();

const fileName = argv[2];

async function main() {
  const loader = new DocxLoader(fileName);
  const textSplitter = new RecursiveCharacterTextSplitter({ chunkSize: 500 });
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
