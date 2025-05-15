FROM node:18-alpine

WORKDIR /app

COPY client/booking_engine_client/package.json ./

RUN yarn global add nodemon ts-node
RUN yarn

COPY . .

CMD ["yarn", "dev"]