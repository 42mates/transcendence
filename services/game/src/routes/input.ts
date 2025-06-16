import { FastifyPluginAsync, FastifyInstance } from 'fastify';
import { PlayerInputMessage } from '../types/messages';
import input from '../game/input';
import { isValidGameId } from '../utils';

const inputRoute: FastifyPluginAsync = async (fastify: FastifyInstance) => {
	fastify.post<{
		Params: { id: string },
		Body: { playerId?: string, input?: PlayerInputMessage["input"] },
		Querystring: { playerId?: string, input?: string }
	}>('/:id/input', async (request, reply) => {
		const { id } = request.params;

		// Prefer body, fallback to querystring
		const playerId = request.body.playerId ?? request.query.playerId;
		const inputRaw = request.body.input ?? request.query.input;

		let playerInput: PlayerInputMessage["input"] | undefined;

		switch (true) {
			case playerId === undefined:
				reply.status(400).send({ error: "Missing playerId" });
				return;
			case inputRaw === undefined:
				reply.status(400).send({ error: "Missing input" });
				return;
			case !isValidGameId(id):
				reply.status(400).send({ error: "Invalid game id format" });
				return;
			case !playerId || (playerId !== "1" && playerId !== "2"):
				reply.status(400).send({ error: "Missing or invalid playerId" });
				return;
			default:
				if (typeof inputRaw === "object" && inputRaw !== null && ("up" in inputRaw || "down" in inputRaw)) {
					playerInput = inputRaw as PlayerInputMessage["input"];
				} else if (typeof inputRaw === "string") {
					if (inputRaw === "up") playerInput = [{ up: true, down: false }];
					else if (inputRaw === "down") playerInput = [{ up: false, down: true }];
				}
				if (!playerInput) {
					reply.status(400).send({ error: "Missing or invalid playerId" });
					return;
				}
				break;
		}

		input({
			type: "player_input",
			gameId: id,
			playerId,
			input: playerInput,
		}, reply);
	});
};

export default inputRoute;