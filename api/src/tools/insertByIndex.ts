import { HNSWLib } from '@langchain/community/vectorstores/hnswlib';
import { OpenAIEmbeddings } from '@langchain/openai';
import { PrismaClient } from '@prisma/client';
import { existsSync, readdirSync } from 'fs';
import { CSVLoader } from 'langchain/document_loaders/fs/csv';
import { DocxLoader } from 'langchain/document_loaders/fs/docx';
import { PDFLoader } from 'langchain/document_loaders/fs/pdf';
import { RecursiveCharacterTextSplitter } from 'langchain/text_splitter';
import { input } from '@inquirer/prompts';

const prisma = new PrismaClient();

enum FileType {
  CSV = 'csv',
  PDF = 'pdf',
  DOCX = 'docx',
}

async function main() {
  const pathName = await input({
    message: '取り込むフォルダを指定してください：',
  });
  const indexName = await input({
    message: '取り込んだデータを特定するキーワードを入力してください：',
  });
  await saveVector(pathName, indexName);
}

export const saveVector = async (folderPath: string, indexName: string) => {
  let files: string[];
  if (existsSync(folderPath)) {
    files = readdirSync(folderPath);
  } else {
    console.error(`${folderPath} は存在しません`);
    return;
  }
  //   if (isIndexNameDuplicate(indexName)) {
  //     throw new Error('そのキーワードはすでに使われています');
  //   }
  console.info('対象フォルダ直下のファイルの読み込み開始');
  const vectorStore = await HNSWLib.fromDocuments([], new OpenAIEmbeddings());
  for (const file of files) {
    console.log(file);
    // 拡張子の取得
    const fileType = getFileType(file);
    const filePath = createPath(folderPath, file);
    console.info(`対象ファイル: ${filePath}`);
    const doc = await switchByFileType(fileType, filePath);
    await vectorStore.addDocuments(doc);
  }
  await vectorStore.save(createPath('MyData', indexName));
  await prisma.index.create({
    data: {
      name: indexName,
    },
  });
};

const getFileType = (fileName: string) => {
  return fileName.split('.').pop();
};

const switchByFileType = async (fileType: string, filePath: string) => {
  let doc = [];
  switch (fileType) {
    case FileType.CSV:
      doc = await loadByCsv(filePath);
      return doc;
    case FileType.PDF:
      doc = await loadByPdf(filePath);
      return doc;
    case FileType.DOCX:
      doc = await loadByDocx(filePath);
      return doc;
    default:
      console.error(filePath + 'は対象外のファイルタイプです');
      break;
  }
};

const createPath = (pathName: string, fileName: string) => {
  return pathName + '/' + fileName;
};

const loadByCsv = async (filePath: string) => {
  console.info('CSV取り込み開始');
  const loader = new CSVLoader(filePath);
  return await loader.loadAndSplit(
    new RecursiveCharacterTextSplitter({ chunkSize: 500, chunkOverlap: 250 }),
  );
};

const loadByPdf = async (filePath: string) => {
  console.info('PDF取り込み開始');
  const loader = new PDFLoader(filePath, { splitPages: false });
  return await loader.loadAndSplit(
    new RecursiveCharacterTextSplitter({ chunkSize: 500, chunkOverlap: 250 }),
  );
};

const loadByDocx = async (filePath: string) => {
  console.info('DOCX取り込み開始');
  const loader = new DocxLoader(filePath);
  return await loader.loadAndSplit(
    new RecursiveCharacterTextSplitter({ chunkSize: 500, chunkOverlap: 250 }),
  );
};

const isIndexNameDuplicate = async (indexName: string) => {
  const indexList = await prisma.index.findMany();
  console.log(indexList);
  return indexList.some((index) => {
    index.name === indexName;
  });
};

main();
