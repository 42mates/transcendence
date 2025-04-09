import Fastify from 'fastify';
import loginRoute from './routes/login';

export default async function startServer() {
  const fastify = Fastify();

  fastify.register(loginRoute);

  try {
    await fastify.listen({ port: 3000, host: '0.0.0.0' });
    console.log('auth service is running on port 3000');
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
}

