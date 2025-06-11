import type { FastifyReply }               from "fastify";
import type { QuitRequest, GameErrorType } from "../types/messages";
import type { QuitResponse }               from "../types/messages"; // <-- Import QuitResponse

import { WebSocket }           from "ws";
import { games }               from "./state";
import { send, isValidGameId } from "../utils";
import { GameInstance }        from "../pong/game.class";

export class GameError extends Error {
	public readonly reply: QuitResponse;
	public readonly http: number;
	constructor(reply: QuitResponse, http: number = 400) {
		super(reply.message);
		this.name = "GameError";
		this.reply = reply;
		this.http = http;
	}
}

function checkQuitInput(msg: QuitRequest): void {
	if (!msg.gameId || (msg.playerId !== "1" && msg.playerId !== "2")) {
		const message = !msg.gameId ? "No game ID provided" : "Invalid player ID";
		const errorResponse: QuitResponse = {
			type: "quit_response",
			gameId: msg.gameId ?? "",
			playerId: msg.playerId ?? null,
			status: "failure",
			reason: "input_error",
			message,
		};
		throw new GameError(errorResponse, 400);
	}
}

function getGame(msg: QuitRequest): GameInstance {
	const gameId = msg.gameId;
	const playerId = msg.playerId;
	if (!isValidGameId(gameId)) {
		const errorResponse: QuitResponse = {
			type: "quit_response",
			gameId,
			playerId,
			status: "failure",
			reason: "invalid_game_id",
			message: "Invalid game ID format",
		};
		throw new GameError(errorResponse, 400);
	}
	const game = games[gameId];
	if (!game) {
		const errorResponse: QuitResponse = {
			type: "quit_response",
			gameId,
			playerId,
			status: "failure",
			reason: "game_not_found",
			message: "Game not found",
		};
		throw new GameError(errorResponse, 404);
	}
	return game;
}

export default function quit(msg: QuitRequest, connection: WebSocket | FastifyReply): void {
	let game: GameInstance;
	try {
		checkQuitInput(msg);
		game = getGame(msg);
	} catch (error) {
		console.error("Quit error:", error);
		if (error instanceof GameError)
			send(connection, error.reply, error.http);
		else {
			const genericError: QuitResponse = {
				type: "quit_response",
				gameId: msg.gameId ?? "",
				playerId: msg.playerId ?? null,
				status: "failure",
				reason: "internal_error",
				message: "Internal server error",
			};
			send(connection, genericError, 500);
		}
		return;
	}

	console.log(`Player ${game.players[0].alias} (${game.players[0].playerId}) and ${game.players[1].alias} (${game.players[1].playerId})`);

	const winner = msg.playerId === "1" ? game.players[1] : game.players[0];
	const loser = msg.playerId === "1" ? game.players[0] : game.players[1];
	game.end(winner, loser);


	const successResponse: QuitResponse = {
		type: "quit_response",
		playerId: msg.playerId,
		gameId: msg.gameId,
		status: "success",
		message: "Player quit successfully",
	};

	send(connection, successResponse, 200);
}
