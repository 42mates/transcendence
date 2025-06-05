import { FastifyPluginAsync, FastifyRequest, FastifyReply, FastifyInstance } from 'fastify';
import { games } from "../game/state";
import type { GameStateMessage } from "../types/messages";

/**
 * Checks if the provided game ID is exactly 8 lowercase alphanumeric characters (a-z, 0-9).
 */
function isValidGameId(id: string): boolean {
	return /^[a-z0-9]{8}$/.test(id);
}


const stateRoute: FastifyPluginAsync = async (fastify: FastifyInstance) => 
{
	fastify.get('/game/:id', async (request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) => {
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