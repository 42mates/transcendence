import type { JoinRequest, JoinResponse} from "../types/messages";

import { WebSocket }                               from "ws";
import { FastifyReply}                             from 'fastify';
import { games, onlineQueues, connectedUsers }     from "../game/state";
import { validateAlias,  }                         from "./alias";
import { createLocalGame, joinLocalGame }          from "./local";
import { tryMatchmake1v1, tryMatchmakeTournament } from "./matchmaking";
import { User }                                    from "./User";
import { GameInstance }                            from "../pong/vars/game.class";
import { InvalidAlias, WaitingForPlayers }         from "./exceptions";


function registerUser(message: JoinRequest, connection: WebSocket | FastifyReply): User | null
{
	const mode = message.payload.mode;
	
	let cleanAlias: string;
	try {
		cleanAlias = validateAlias(message);
	}
	catch (error: any) {
		if (connection) {
			const response: JoinResponse = {
				type: "join_response",
				status: "rejected",
				alias: null,
				playerId: null,
				gameId: null,
				reason: error.message,
			};
			connection.send(JSON.stringify(response));
		}
		return null;
	}

	const user = new User(
		connection,
		cleanAlias,
		mode,
		"queued"
	);

	// Add user to connected users if online
	if (mode !== "local") connectedUsers.push(user);
	
	if (mode === "1v1" || mode === "tournament" 
		&& !onlineQueues[mode].some(u => u.alias === user.alias))
		onlineQueues[mode].push(user);

	return user;
}

export function joinGame(players: User[], gameId: string, bracket?: JoinResponse["bracket"])
{
	games[gameId] = new GameInstance([players[0], players[1]], gameId, "pending");

	const matchInfo1: JoinResponse = {
		type: "join_response",
		status: "accepted",
		playerId: "1",
		alias: players[0].alias,
		gameId: gameId,
		reason: null,
		dimensions: games[gameId].dimensions,
		bracket: bracket || undefined
	};
	const matchInfo2: JoinResponse = {
		type: "join_response",
		status: "accepted",
		playerId: "2",
		alias: players[1].alias,
		gameId: gameId,
		reason: null,
		dimensions: games[gameId].dimensions,
		bracket: bracket || undefined
	};
	players[0].send(matchInfo1);
	players[1].send(matchInfo2);
}

export default function join(message: JoinRequest, connection: WebSocket | FastifyReply): void {
	console.log(
		`${connection instanceof WebSocket ? "[ws]" : "[http]"} Join message received: ${JSON.stringify(message)}`
	);

	const user = registerUser(message, connection) 
	if (!user) return ;

	const mode = message.payload.mode;
	try {
		if (mode === "1v1")
			tryMatchmake1v1(user);
		else if (mode === "tournament")
			tryMatchmakeTournament(user);
		else if (mode === "local") {
			const { gameId } = message.payload;
			if (!gameId)
				createLocalGame(user);
			else
				joinLocalGame(user, gameId);
		}
	}
	catch (exception: any) {
		if (exception instanceof InvalidAlias) {
			console.log(exception.message);
			user.send(exception.response);
		}
		else if (exception instanceof WaitingForPlayers) {
			console.log(exception.message);
			user.send(exception.response);
		}
		else {
			console.error("Error during join process:", exception);
			const response: JoinResponse = {
				type: "join_response",
				status: "rejected",
				alias: user.alias,
				playerId: null,
				gameId: null,
				reason: "An error occurred while processing your request.",
			};
			user.send(response);
		}
	}
}
