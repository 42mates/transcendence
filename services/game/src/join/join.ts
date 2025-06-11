import type { JoinRequest, JoinResponse} from "../types/messages";

import { WebSocket }                               from "ws";
import { FastifyReply}                             from 'fastify';
import { games, onlineQueues, connectedUsers }     from "../game/state";
import { validateAlias,  }                         from "./alias";
import { User }                                    from "./User";
import { send, isValidAvatar }                     from "../utils";
import { tryMatchmakeLocal,
		 tryMatchmake1v1, 
		 tryMatchmakeTournament }                  from "./matchmaking";
import { InvalidNumberOfPlayers,
		 InvalidAlias,
		 WaitingForPlayers, 
		 TournamentNotFound}                       from "./exceptions";

function registerUsers(message: JoinRequest, connection: WebSocket | FastifyReply): User[] | null
{
	const mode = message.payload.mode;
	const avatars = message.payload.avatar || [];
	const users: User[] = [];

	for (let i = 0; i < message.payload.alias.length; i++) {
		let cleanAlias: string;
		try { cleanAlias = validateAlias(message.payload.alias[i], mode); }
		catch (error: any) { throw new InvalidAlias(error, message.payload.alias[i]); }

		let avatar = avatars[i] || `/assets/default_avatar${(i + 1).toString()}.png`;
		if (!isValidAvatar(avatar)) avatar = `/assets/default_avatar${(i + 1).toString()}.png`;
		const user = new User(
			connection,
			cleanAlias,
			avatar,
			mode,
			users.length === 0 ? "1" : "2",
			"queued"
		);
		users.push(user);
		console.log(`User registered: ${user.alias} (${mode}) avatar=${avatar}`);
	}

	if ((mode === "local" && users.length !== 2)
		|| (mode !== "local" && users.length !== 1))
		throw new InvalidNumberOfPlayers(mode, users.length);

	// Add user to connected users if online
	if (mode !== "local")
	{
		for (const user of users) 
		{
			connectedUsers.push(user);
			if (!onlineQueues[mode].some(u => u.alias === user.alias))
				onlineQueues[mode].push(user);
		}
	}

	return users;
}

export function sendJoinResponse(gameId: string, tournament?: JoinResponse["tournament"])
{
	const players = games[gameId].players;
	if (players[0].playerId !== "1" && players[0].playerId !== "2")
		throw new Error("Invalid playerId for one of the players");

	const matchInfo1: JoinResponse = {
		type: "join_response",
		status: "accepted",
		playerId: "1",
		aliases: [players[0].alias, players[1].alias],
		gameId: gameId,
		reason: null,
		dimensions: games[gameId].dimensions,
		avatar: [players[0].avatar, players[1].avatar],
		tournament: tournament || undefined
	};
	const matchInfo2: JoinResponse = {
		type: "join_response",
		status: "accepted",
		playerId: "2",
		aliases: [players[0].alias, players[1].alias],
		gameId: gameId,
		reason: null,
		dimensions: games[gameId].dimensions,
		avatar: [players[0].avatar, players[1].avatar],
		tournament: tournament || undefined
	};

	players[0].send(matchInfo1);
	players[1].send(matchInfo2);
}

export default function join(message: JoinRequest, connection: WebSocket | FastifyReply): void {
	console.log(`${connection instanceof WebSocket ? "[ws]" : "[http]"} Join message received: ${JSON.stringify(message)}`);

	const mode = message.payload.mode;
	let users: User[] | null = null;
	try {
		users = registerUsers(message, connection)!;

		if (mode === "local") 
			tryMatchmakeLocal(users);
		else if (mode === "1v1")
			tryMatchmake1v1(users[0]);
		else if (mode === "tournament")
			tryMatchmakeTournament(users[0]);
	}
	catch (exception: any) {
		if (exception instanceof InvalidNumberOfPlayers 
			|| exception instanceof InvalidAlias 
			|| exception instanceof WaitingForPlayers
			|| exception instanceof TournamentNotFound)
		{
			console.error("Invalid Request:", exception.message);
			send(connection, exception.response);
		}
		else {
			console.error("Error during join process:", exception);
			const response: JoinResponse = {
				type: "join_response",
				status: "rejected",
				aliases: users ? [users[0].alias, users[1].alias] : null,
				playerId: "1",
				gameId: null,
				reason: "An error occurred while processing your request.",
			};
			send(connection, response);
		}
	}
}
