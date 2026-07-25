FROM node:20-alpine

WORKDIR /app

COPY package.json /app/
RUN npm install

COPY slots-server.js /app/

EXPOSE 3011

CMD ["node", "slots-server.js"]
