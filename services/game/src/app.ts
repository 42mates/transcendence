import Fastify from 'fastify';
import matchRoutes from './routes/match';

const server = Fastify();

// Register routes with the prefix `/game`
server.register(matchRoutes, { prefix: '/game' });

server.listen({ port: 3001 }, (err: Error | null, address: string) => {
  if (err) {
    console.error(err);
    process.exit(1);
  }
  console.log(`Game service running at ${address}`);
});
