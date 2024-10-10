FROM socrata/runit-nodejs-focal:20x

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install

COPY ./src ./src
COPY ./app.js .

EXPOSE 3000

ENTRYPOINT ["npm", "start"]