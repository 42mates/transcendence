#! TEMPORARY DOCKERFILE FOR FASTER DEVELOPMENT
#! This Dockerfile is used for development purposes only.

FROM node:20-alpine

WORKDIR /app

COPY package.json ./
RUN npm install

COPY . .

EXPOSE 5173
CMD ["npm", "run", "dev"]