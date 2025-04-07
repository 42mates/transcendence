import Fastify from 'fastify';
import loginRoutes from './routes/login';

const server = Fastify();

// Register routes with the prefix `/auth`
server.register(loginRoutes, { prefix: '/auth' });

server.listen({ port: 3000 }, (err, address) => {
  if (err) {
    console.error(err);
    process.exit(1);
  }
  console.log(`Auth service running at ${address}`);
});
