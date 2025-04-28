FROM gcc:latest

WORKDIR /app
COPY writer.c .

RUN cc -o writer writer.c
CMD ["./writer"]
