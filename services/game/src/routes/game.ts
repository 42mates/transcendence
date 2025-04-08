import { FastifyPluginAsync } from 'fastify';

const gameRoute: FastifyPluginAsync = async (fastify) => {
  fastify.post('/game', async (request, reply) => {
    reply.send({ message: 'game running' });
  });
};

export default gameRoute;
