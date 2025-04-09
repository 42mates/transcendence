import Fastify from 'fastify';

const server = Fastify();

server.get('/auth/test', async (request, reply) => {
  return { message: 'Auth service is working!' };
});

server.listen({ port: 3000 }, (err, address) => {
  if (err) {
    console.error(err);
    process.exit(1);
  }
  console.log(`Auth service running at ${address}`);
});
