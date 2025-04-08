import { FastifyPluginAsync } from 'fastify';

const loginRoute: FastifyPluginAsync = async (fastify) => {
  fastify.post('/login', async (request, reply) => {
    reply.send({ message: 'game running' });
  });
};

export default loginRoute;
