import type { JoinRequest, JoinResponse} from "../types/messages";

import { WebSocket }                                                         from "ws";
import { FastifyPluginAsync, FastifyRequest, FastifyReply, FastifyInstance } from 'fastify';
import { matchmakingQueues }                                                 from "../game/state";
import { validateAlias,  }                                                   from "../join/alias";
import { createLocalGame, joinLocalGame }                                    from "../join/local";
import { tryMatchmake1v1, tryMatchmakeTournament }                           from "../join/matchmaking";
import { User }                                                              from "../join/User";
import { connectedUsers }                                                    from "../game/state";

export class WaitingForPlayers extends Error {
	constructor(message = "Waiting for more players to join") {
		super(message);
		this.name = "WaitingForPlayers";
	}
}

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
	
	return user;
}


export default function join(message: JoinRequest, connection: WebSocket | FastifyReply): void {
	console.log("Join message received:", message);

	const user = registerUser(message, connection) 
	if (!user) return ;

	const mode = message.payload.mode;
	try {
		
		if (mode === "1v1" || mode === "tournament") {
			matchmakingQueues[mode].push(user);
			if (mode === "1v1")
				tryMatchmake1v1();
			else
				tryMatchmakeTournament();
		} else if (mode === "local") {
			const { gameId } = message.payload;
			if (!gameId)
				createLocalGame(user);
			else
				joinLocalGame(user, gameId);
		}
	}
	catch (error: any) {
		if (error instanceof WaitingForPlayers) {
			console.log(error.message);
		}
		else {
			console.error("Error during join process:", error);
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

let i = 0;
export const joinRoute: FastifyPluginAsync = async (fastify: FastifyInstance) => 
{
	fastify.get('/join', async (request: FastifyRequest<{ Querystring: { alias: string } }>, reply: FastifyReply) => {
		console.log("Join request received:", request.body);
		let message = request.body as JoinRequest;
		if (!message)
		{
			message = {
				type: "join_request",
				payload: {
					alias: "player" + i++,
					mode: "1v1",
					gameId: null
				}
			};
		}
		else if (message.type !== "join_request" ||
			typeof message.payload !== "object" ||
			typeof message.payload.alias !== "string" ||
			!["1v1", "tournament", "local"].includes(message.payload.mode) ||
			!("gameId" in message.payload) ||
			(message.payload.gameId !== null && typeof message.payload.gameId !== "string"))
		{
			reply.status(400).send({ error: "Invalid join request" });
			return;
		}
		join(message, reply);
		return;
	});
};
