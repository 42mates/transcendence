import { FastifyPluginAsync, FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';

const joinRoute: FastifyPluginAsync = async (fastify) => {
	fastify.post('/join', async (request, reply) => {
	  console.log('auth/join OK, sending response'); // Use Fastify's logger
	  reply.send({ message: 'api/auth/join route accessed successfully' });
	});
  };
  
  export default joinRoute;