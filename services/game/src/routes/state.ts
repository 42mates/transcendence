import { FastifyPluginAsync, FastifyRequest, FastifyReply, FastifyInstance } from 'fastify';


const stateRoute: FastifyPluginAsync = async (fastify: FastifyInstance) => 
{
	fastify.get('/state', async (request: FastifyRequest<{ Querystring: { alias: string } }>, reply: FastifyReply) => {

	});
};

export default stateRoute;
