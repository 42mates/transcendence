import Fastify from 'fastify';

const server = Fastify();

server.get('/game/test', async (request, reply) => {
  return { message: 'Game service is working!' };
});

server.listen({ port: 3000 }, (err, address) => {
  if (err) {
    console.error(err);
    process.exit(1);
  }
  console.log(`Game service running at ${address}`);
});
