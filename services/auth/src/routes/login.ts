import { FastifyPluginAsync } from 'fastify';

const loginRoute: FastifyPluginAsync = async (fastify) => {
  fastify.post('/login', async (request, reply) => {
    reply.send({ message: 'auth login running' });
  });
};

export default loginRoute;
