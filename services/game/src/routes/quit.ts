import { FastifyPluginAsync, FastifyRequest, FastifyReply, FastifyInstance } from 'fastify';
import type { QuitRequest } from '../types/messages';
import quit from '../game/quit';

const quitRoute: FastifyPluginAsync = async (fastify: FastifyInstance) => 
{
	fastify.post<{
		Body: { gameId?: string, playerId?: "1" | "2", reason?: string }
	}>('/quit', async (request, reply) => {
		const { gameId, playerId, reason } = request.body;

		if (!gameId)
			reply.status(400).send({ error: "Missing gameId" });
		if (!playerId)
			reply.status(400).send({ error: "Missing playerId" });
		if (playerId !== "1" && playerId !== "2")
			reply.status(400).send({ error: "Invalid playerId, must be '1' or '2'" });

		const quitRequest: QuitRequest = {
			type: "quit_request",
			gameId: gameId!,
			playerId: playerId!,
			reason,
		};

		quit(quitRequest, reply);
	});
};

export default quitRoute;