import Fastify from 'fastify';
import loginRoute from './routes/game';

export default async function startServer() {
  const fastify = Fastify();

  fastify.register(loginRoute);

  try {
    await fastify.listen({ port: 3001, host: '0.0.0.0' });
    console.log('game service is running on port 3001');
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
}
