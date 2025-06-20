import { FastifyPluginAsync, FastifyRequest, FastifyReply, FastifyInstance } from 'fastify';
import { connectedUsers } from "../game/state";
import { sanitizeAlias } from "../join/alias";

const aliasRoute: FastifyPluginAsync = async (fastify: FastifyInstance) => 
{
	fastify.get('/check-alias', async (request: FastifyRequest<{ Querystring: { alias: string } }>, reply: FastifyReply) => {
		const { alias } = request.query;
		const cleanAlias = sanitizeAlias(alias);
		if (!cleanAlias) {
			console.log(`Alias "${alias}" is invalid.`);
			reply.status(400).send({ valid: false, reason: 'Invalid alias' });
			return;
		}
		if (connectedUsers.some(u => u.alias === cleanAlias)) {
			console.log(`Alias "${cleanAlias}" is already in use.`);
			reply.status(409).send({ valid: false, reason: 'Alias already in use' });
			return;
		}
		console.log(`Alias check for "${cleanAlias}" passed.`);
		reply.send({ valid: true });
	});
};

export default aliasRoute;
