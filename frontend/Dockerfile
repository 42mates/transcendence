FROM node:18-alpine

WORKDIR /app

RUN mkdir -p /app/build

COPY package*.json ./
RUN npm install

COPY . .

CMD ["npm", "run", "dev"]
