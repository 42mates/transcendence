import { FastifyPluginAsync, FastifyReply, FastifyInstance } from 'fastify';
import { WebSocket }                                         from "ws";
import { games }                                             from "../game/state";
import { send, isValidGameId }                               from "../utils";

import type { PlayerInputMessage, GameError} from "../types/messages"; // Messages JSON


export default function input(msg: PlayerInputMessage, connection: WebSocket | FastifyReply): void {
	if (msg.gameId === null || msg.playerId === null) {
		console.error("Invalid gameId or playerId in input message:", msg);
		const errorResponse: GameError = {
			type: "game_error",
			gameId: msg.gameId ?? undefined,
			playerId: msg.playerId ?? undefined,
			message: "Invalid game ID or player ID",
		};
		send(connection, errorResponse, 400);
		return;
	}

	const game = games[msg.gameId];
	if (!game) {
		console.error("Game not found for gameId:", msg.gameId);
		const errorResponse: GameError = {
			type: "game_error",
			gameId: msg.gameId,
			playerId: msg.playerId,
			message: "Game not found",
		};
		send(connection, errorResponse, 404);
		return;
	}
	if (game.status !== "running") {
		game.run();
	}
	else {
		const playersinput: PlayerInputMessage["input"][] = msg.playerId === "1" ?
			[msg.input, { up: false, down: false }] :
			[{ up: false, down: false }, msg.input];
		game.receivedInputs(playersinput);
	}
}

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
					if (inputRaw === "up") playerInput = { up: true, down: false };
					else if (inputRaw === "down") playerInput = { up: false, down: true };
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

export { inputRoute };