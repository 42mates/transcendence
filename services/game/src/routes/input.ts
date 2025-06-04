import { WebSocket } from "ws";
import { FastifyReply } from 'fastify';
import { send } from "../utils";

import type { PlayerInputMessage, GameStateMessage, GameError} from "../types/messages"; // Messages JSON
import { games } from "../game/state";


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
		

	console.log("Received player input:", msg.input);
	const playersinput: PlayerInputMessage["input"][] = msg.playerId === "1" ?
		[msg.input, { up: false, down: false }] :
		[{ up: false, down: false }, msg.input];
	game.receivedInputs(playersinput);
}

