import { FastifyPluginAsync } from 'fastify';

const loginRoute: FastifyPluginAsync = async (fastify) => {
  fastify.post('/login', async (request, reply) => {
	console.log('auth/login OK, sending response'); // Use Fastify's logger
    reply.send({ message: 'api/auth/login route accessed successfully' });
  });
};

export default loginRoute;
