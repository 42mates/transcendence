import { tournaments, onlineQueues} from "../game/state";
import { getUniqueGameId } from "../utils";

import { GameInstance } from "../pong/game.class";
import { sendJoinResponse } from "./join";
import { User } from "../join/User";
import { games } from "../game/state";
import Tournament, { createTournament } from "./tournament";

import { InvalidNumberOfPlayers, WaitingForPlayers, TournamentNotFound } from "./exceptions";


// local matchmaking
export function tryMatchmakeLocal(players: User[]) {
	if (players.length !== 2)
		throw new InvalidNumberOfPlayers("local", players.length);

	const gameId = getUniqueGameId();
	games[gameId] = new GameInstance(players, gameId, "local", "pending");
	players[0].playerId = "1";
	players[1].playerId = "2";

	sendJoinResponse(gameId);
}

// 1v1 matchmaking
export function tryMatchmake1v1(user: User) {
	if (onlineQueues["1v1"].length < 2)
		throw new WaitingForPlayers(user);
	
	const [player1, player2] = onlineQueues["1v1"].splice(0, 2);
	const gameId = getUniqueGameId();

	games[gameId] = new GameInstance([player1, player2], gameId, "1v1", "pending");
	player1.playerId = "1";
	player2.playerId = "2";

	sendJoinResponse(gameId);
}

export function tryMatchmakeTournament(user: User, tournamentId?: string) {

	console.log(`[${tournamentId || "new"}] User ${user.alias} trying to join tournament matchmaking`);

	let t: Tournament;
	if (!tournamentId){
		t = createTournament(user);
		t.start();
		return;
	}

	t = tournaments[tournamentId];
	if (!t || t.players.indexOf(user) === -1)
		throw new TournamentNotFound(user, tournamentId || null);

	user.status = "queued";
	t.update();
	if (user.status === "queued")
	{
		console.log(`[${tournamentId}] User ${user.alias} added to tournament queue`);
		throw new WaitingForPlayers(user);
	}
}
