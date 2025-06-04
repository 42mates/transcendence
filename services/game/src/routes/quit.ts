import { FastifyPluginAsync, FastifyRequest, FastifyReply, FastifyInstance } from 'fastify';


const quitRoute: FastifyPluginAsync = async (fastify: FastifyInstance) => 
{
	fastify.get('/quit', async (request: FastifyRequest<{ Querystring: { alias: string } }>, reply: FastifyReply) => {
		
	});
};

export default quitRoute;
