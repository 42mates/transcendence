import { WebSocket } from "ws";
import { FastifyReply } from 'fastify';
import { send } from "../utils";

import type { PlayerInputMessage, GameStateMessage, GameError} from "../types/messages"; // Messages JSON
import { games } from "../game/state";
import { startGame } from "../pong/run";

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

	if (game.status !== "running")
 		game.start();
	else {
		console.log("Received player input:", msg.input);
		game.receivedInputs();
	}


	//const okResponse: GameStateMessage = {
	//	type: "game_state",
	//	ball: { x: Math.floor(Math.random() * 101), y: Math.floor(Math.random() * 101) },
	//	paddles: [
	//		{ x: 0,   y: Math.floor(Math.random() * 101) },
	//		{ x: 100, y: Math.floor(Math.random() * 101) }
	//	],
	//	score: [0, 0],
	//	status: "action received successfully: " + (msg.input.up ? "up" : "down"),
	//};
	//console.log("Sending game state response:", okResponse);
	//send(connection, okResponse);
}


