import { FastifyPluginAsync } from 'fastify';

const joinRoute: FastifyPluginAsync = async (fastify) => {
  fastify.post('/join', async (request, reply) => {
    reply.send({ message: 'game/join running' });
  });
};

export default joinRoute;
