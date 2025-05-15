FROM node:18-alpine

WORKDIR /app

COPY package.json ./

RUN yarn global add nodemon ts-node
RUN yarn

COPY . .

CMD ["yarn", "dev"]

