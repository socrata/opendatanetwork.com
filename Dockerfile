FROM socrata/runit-nodejs-focal:20x

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install

COPY ./src ./src
COPY ./app.js .

EXPOSE 3000

ENV MEMCACHIER_SERVERS=
ENV MEMCACHIER_USERNAME=
ENV MEMCACHIER_PASSWORD=

ENTRYPOINT ["npm", "start"]