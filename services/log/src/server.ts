import Fastify from 'fastify';
import logRoute from './routes/log';

export default async function startServer() {
  const fastify = Fastify();

  fastify.register(logRoute);

  try {
    await fastify.listen({ port: 3002, host: '0.0.0.0' });
    console.log('log service is running on port 3002');
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
}
