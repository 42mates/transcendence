import type { FastifyReply } from "fastify";
import type { QuitRequest, QuitResponse } from "../types/messages";

import { WebSocket } from "ws";
import { games, connectedUsers, onlineQueues } from "./state";
import { send, isValidGameId, getUser } from "../utils";
import { GameInstance } from "../pong/game.class";
import { User } from "../join/User";
import { removeConnectedUserFromDB } from "../db/connectedUsers";


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

class EmptyRequest extends GameError {
	constructor() {
		super({
			type: "quit_response",
			alias: "",
			status: "failure",
			message: "Empty request",
		}, 400);
		this.name = "EmptyRequest";
	}
}

class UserNotFoundError extends GameError {
	constructor(alias: string) {
		super({
			type: "quit_response",
			alias: alias,
			status: "failure",
			message: `User with alias "${alias}" not found`,
		}, 404);
		this.name = "UserNotFoundError";
	}
}

function successResponse(alias: string, gId?: string, pId?: "1" | "2"): QuitResponse {
	return {
		type: "quit_response",
		alias,
		playerId: pId,
		gameId: gId,
		status: "success",
		message: "Player removed from waiting queue",
	}
};

function removeWaitingPlayer(alias: string): QuitResponse {
	const user = getUser(alias);
	if (!user)
		throw new UserNotFoundError(alias);

	// Remove from onlineQueues
	for (const queue of Object.values(onlineQueues)) {
		const qIdx = queue.findIndex(u => u.alias === alias);
		if (qIdx !== -1) queue.splice(qIdx, 1);
	}

	// Remove from connectedUsers
	const idx = connectedUsers.findIndex(u => u.alias === alias);
	if (idx !== -1) {
		connectedUsers.splice(idx, 1);
		removeConnectedUserFromDB(user.alias);
	}

	return successResponse(user.alias);
}


function getGame(msg: QuitRequest): GameInstance {
	let message: string | undefined = undefined;
	let http: number = 400;
	if (!msg.gameId)
		message = "No game ID provided";
	else if (!isValidGameId(msg.gameId))
		message = "Invalid game ID format";
	else if (!msg.playerId)
		message = "No player ID provided";
	else if (msg.playerId !== "1" && msg.playerId !== "2")
		message = "Invalid player ID";
	else if (!games[msg.gameId])
	{
		message = "Game not found";
		http = 404;
	}
	else {
		const playerIdx = msg.playerId === "1" ? 0 : 1;
		if (!games[msg.gameId].players[playerIdx])
			message = `Player ${msg.playerId} not found in game ${msg.gameId}`;
	}

	if (message) {
		const errorResponse: QuitResponse = {
			type: "quit_response",
			alias: msg.alias ?? "",
			gameId: msg.gameId,
			playerId: msg.playerId,
			status: "failure",
			message,
		};
		throw new GameError(errorResponse, http);
	}

	return games[msg.gameId!]
}

export default function quit(msg: QuitRequest, connection: WebSocket | FastifyReply): void {
	let game: GameInstance;
	try {
		if (!msg) throw new EmptyRequest();
		let response;
		if (!msg.gameId)
			response = removeWaitingPlayer(msg.alias);
		else {
			game = getGame(msg);

			if (game.mode === "local")
				delete games[game.id];
			else {
				const quitter = getUser(msg.alias);
				if (!quitter)
					throw new UserNotFoundError(msg.alias);
				game.quit(quitter);
			}
				
			response = successResponse(msg.alias, game.id, msg.playerId);
		}

		console.log(`Player ${msg.playerId} quit game ${msg.gameId}. Reason: ${msg.reason ?? "No reason provided"}`);
		send(connection, response, 200);
	} 
	catch (e) 
	{
		console.error("Quit error:", e);
		if (e instanceof GameError)
			send(connection, e.reply, e.http);
		else
			console.error("Unexpected error in quit handler:", e);
	}
}
