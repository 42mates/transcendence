import {FastifyPluginAsync, FastifyInstance, FastifyRequest, FastifyReply} from 'fastify';

const joinRoute: FastifyPluginAsync = async (fastify) => {
	fastify.post('/game', async (request, reply) => {
		console.log('auth/game OK, sending response'); // Use Fastify's logger
		reply.send({message: 'api/auth/join route accessed successfully'});
	});
};

export default joinRoute;
