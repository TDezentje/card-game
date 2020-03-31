FROM node:10.16.1-alpine

RUN apk add --update \
    make \
    python \
  && rm -rf /var/cache/apk/*

WORKDIR /usr/src/app

COPY package*.json ./
RUN npm install --only=production

EXPOSE 8080

ADD ./dist ./

CMD [ "node", "server.js" ]