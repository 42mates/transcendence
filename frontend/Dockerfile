FROM node:18-alpine

WORKDIR /app

RUN mkdir -p /app/build

COPY package*.json ./
RUN npm install && npm install -g vite

COPY . .

CMD ["npm", "run", "dev"]
