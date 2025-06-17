import { FastifyPluginAsync, FastifyRequest, FastifyReply, FastifyInstance } from 'fastify';
import { games } from "../game/state";
import { isValidGameId } from "../utils";
import type { GameStateMessage } from "../types/messages";

const stateRoute: FastifyPluginAsync = async (fastify: FastifyInstance) => 
{
	fastify.get('/:id/state', async (request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) => {
		const { id } = request.params;

		// Vérifie le format de l’id (alphanumérique, 8 caractères)
		if (!isValidGameId(id)) {
			reply.status(400).send({ error: "Invalid game id format" });
			return;
		}

		const game = games[id];
		if (!game) {
			reply.status(404).send({ error: "Game not found" });
			return;
		}

		const state: GameStateMessage = game.getState();
		reply.send(state);
	});
};

export default stateRoute;