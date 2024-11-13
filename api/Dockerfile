FROM node:20.10.0

WORKDIR /app

COPY package*.json ./

RUN npm i -g @nestjs/cli

RUN yarn install

COPY . .

COPY startup.sh /startup.sh
RUN chmod 744 /startup.sh

# コンテナ起動時
CMD ["/startup.sh"]