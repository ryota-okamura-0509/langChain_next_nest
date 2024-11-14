import { Injectable, Logger } from '@nestjs/common';
import { Memo, Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { PrismaVectorStore } from '@langchain/community/vectorstores/prisma';
import { OpenAI, OpenAIEmbeddings } from '@langchain/openai';
import { HNSWLib } from '@langchain/community/vectorstores/hnswlib';
import { RetrievalQAChain, loadQAStuffChain } from 'langchain/chains';
import { CheerioWebBaseLoader } from 'langchain/document_loaders/web/cheerio';
import { CharacterTextSplitter } from '@langchain/textsplitters';

const BASE_URL = 'https://ja.wikipedia.org/wiki/';
@Injectable()
export class MemoService {
  private readonly logger = new Logger(MemoService.name);

  private readonly maxSearchResults = 5;

  constructor(private readonly prisma: PrismaService) {}

  async search(query: string): Promise<Memo> {
    this.logger.log(`search`, { query });
    // vector store
    const vectorStore = PrismaVectorStore.withModel<Memo>(this.prisma).create(
      new OpenAIEmbeddings({
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
    // ベクトルデータから類似度が高い順に検索
    const result = await vectorStore.similaritySearch(
      query,
      this.maxSearchResults,
    );
    console.log(JSON.stringify(result, null, 2));
    const memoIds: number[] = result.map((result) => result.metadata.id);
    // 類似度が高い順にメモを取得
    const memoList: Memo[] = [];
    for (const id of memoIds) {
      const memo = await this.prisma.memo.findUnique({
        where: {
          id,
        },
      });
      memoList.push(memo);
    }
    console.log('memoList', memoList);
    const data: { content: string }[] = [];
    data.push({ content: memoList[0].content });
    if (memoList[0].filePath) {
      memoList[0].content =
        memoList[0].content +
        '\n\n' +
        `ファイルのパスは${memoList[0].filePath}です`;
    }
    console.log('data', data);
    return memoList[0];
  }

  async searchLlm(query: string): Promise<{ content: string }> {
    const vectorStore = await HNSWLib.load('MyData', new OpenAIEmbeddings());
    const model = new OpenAI({});
    const chain = RetrievalQAChain.fromLLM(model, vectorStore.asRetriever());
    const answer = await chain.invoke({
      query: query,
    });
    return {
      content: answer.text,
    };
  }

  async searchIndex(
    query: string,
    index: string,
  ): Promise<{ content: string }> {
    const vectorStore = await HNSWLib.load(
      'MyData' + '/' + index,
      new OpenAIEmbeddings(),
    );
    const model = new OpenAI({});
    const chain = RetrievalQAChain.fromLLM(model, vectorStore.asRetriever());
    const answer = await chain.invoke({
      query: query,
    });
    return {
      content: answer.text,
    };
  }

  async searchWeb(query: string): Promise<{ content: string }> {
    const url = BASE_URL + query;
    console.log('URLです5: ', url);
    const loader = new CheerioWebBaseLoader(url);
    const docs = await loader.load();
    const splitter = new CharacterTextSplitter({
      chunkSize: 50000,
      chunkOverlap: 100,
    });
    const docOutput = await splitter.splitDocuments([docs[0]]);
    const model = new OpenAI({});
    const chain = loadQAStuffChain(model);
    const answer = await chain.call({
      input_documents: docOutput,
      question: '要約して',
    });
    console.log('answer', answer);
    return {
      content: answer.text,
    };
  }

  /**
   * agent未実装
   */
  // async searchAgent(query: string): Promise<{ content: string }> {
  //   const chatModel = new ChatOpenAI({
  //     modelName: 'gpt-3.5-turbo-1106',
  //     temperature: 0.2,
  //     streaming: true,
  //   });

  //   const vectorStore = await HNSWLib.load('MyData', new OpenAIEmbeddings());
  //   const retriever = vectorStore.asRetriever();
  //   const tool = createRetrieverTool(retriever, {
  //     name: 'search_latest_knowledge',
  //     description: 'search_latest_knowledge',
  //   });
  // }
}
