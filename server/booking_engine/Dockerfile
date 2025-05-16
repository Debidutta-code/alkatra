FROM node:18-alpine

WORKDIR /app

COPY server/booking_engine/package.json ./

RUN yarn global add nodemon ts-node
RUN yarn

COPY . .

CMD ["yarn", "dev"]