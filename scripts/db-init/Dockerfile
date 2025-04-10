FROM node:18-alpine

WORKDIR /app
COPY sqlite.sql entrypoint.sh ./
RUN apk add sqlite

ENTRYPOINT ["sh", "./entrypoint.sh"]