FROM node:14

WORKDIR /crypto-opnbot

COPY . ./

RUN npm install

CMD npm run start
