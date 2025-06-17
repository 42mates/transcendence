import type { FastifyReply } from "fastify";
import { WebSocket } from "ws";
import { games } from "./state";
import { send, isValidGameId } from "../utils";

import type { PlayerInputMessage, GameErrorType } from "../types/messages"; // Messages JSON
import { GameInstance } from "../pong/game.class"; // GameInstance class


export class GameError extends Error {
	public readonly reply: GameErrorType;
	public readonly http: number;
	constructor(reply: GameErrorType, http: number = 400) {
		super(reply.message);
		this.name = "GameError";
		this.reply = reply;
		this.http = http;
	}
}


function checkInput(msg: PlayerInputMessage): void {
	if (msg.gameId === null || msg.playerId !== "1" && msg.playerId !== "2")
	{
		const message = msg.gameId === null ? "No game ID provided" : "Invalid player ID";
		const errorResponse: GameErrorType = {
			type: "game_error",
			gameId: msg.gameId ?? undefined,
			playerId: msg.playerId ?? undefined,
			message: message,
		};
		throw new GameError(errorResponse, 400);
	}
}

function getGame(msg: PlayerInputMessage): GameInstance {
	let gameId = msg.gameId;
	const playerId = msg.playerId;
	if (!gameId || !isValidGameId(gameId)) {
		const errorResponse: GameErrorType = {
			type: "game_error",
			gameId: gameId ?? undefined,
			playerId: playerId,
			message: "Invalid game ID format",
		};
		throw new GameError(errorResponse, 400);
	}

	gameId = gameId as string;

	const game = games[gameId];
	if (!game) {
		const errorResponse: GameErrorType = {
			type: "game_error",
			gameId: gameId,
			playerId: playerId,
			message: "Game not found",
		};
		throw new GameError(errorResponse, 404);
	}

	//if (game.players[0]

	return game;
}

export default function input(msg: PlayerInputMessage, connection: WebSocket | FastifyReply): void {

	let game: GameInstance;

	try {
		checkInput(msg);
		game = getGame(msg);
	}
	catch (error) {
		console.error("Input error:", error);
		if (error instanceof GameError)
			send(connection, error.reply, error.http);
		else 
			send(connection, error, 500);
		return;
	}
	if (game.status !== "running")
		game.run();
	else
	{
		//console.log(`Updating inputs for game ${msg.gameId} with player ${msg.input.length === 2 ? msg.playerId : "both"}`);
		//const id =  msg.input.length === 2 ? "local" : msg.playerId;
		//console.log(id, JSON.stringify(msg.input));
		if (msg.input.length === 2)
			game._inputs = msg.input;
		else if (msg.playerId === "1")
			game._inputs[0] = msg.input[0];
		else if (msg.playerId === "2")
			game._inputs[1] = msg.input[0];
	}
}

