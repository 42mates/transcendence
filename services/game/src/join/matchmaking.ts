import { tournaments, onlineQueues,
		 tnWinnersQueue,
		 tnLosersQueue }                from "../game/state";
import { getUniqueGameId, send }                      from "../utils";
import { InvalidNumberOfPlayers,
		 WaitingForPlayers,
		TournamentNotFound }                    from "./exceptions";
import { GameInstance }                         from "../pong/game.class";
import { sendJoinResponse }                     from "./join";
import { User }                                 from "../join/User";
import { games }                                from "../game/state";
import { createTournament, getFrontendBracket } from "./tournament";


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

	if (!tournamentId)
	{
		createTournament(user);
		return;
	}

	const t = tournaments[tournamentId];
	if (!t)
		throw new TournamentNotFound(user, tournamentId);

	if (t.game1.status !== "ended" || t.game2.status !== "ended")
	{
		t.status = "waiting";
		throw new WaitingForPlayers(user);
	}
	if (!t.game3 || !t.game4)
		throw new Error("Invalid tournament state: game3 or game4 is missing");


	const wQueue = tnWinnersQueue[tournamentId];
	const lQueue = tnLosersQueue[tournamentId];
	switch (user.alias) {
		case t.game1.winner?.alias:
			wQueue.w1_ready = true;
			break;
		case t.game2.winner?.alias:
			wQueue.w2_ready = true;
			break;
		case t.game1.loser?.alias:
			lQueue.l1_ready = true;
			break;
		case t.game2.loser?.alias:
			lQueue.l2_ready = true;
			break;
		default:
			throw new Error("User is not a participant of the tournament");
	}

	if (wQueue.w1_ready && wQueue.w2_ready)
		sendJoinResponse(t.game3.id, getFrontendBracket(tournamentId));
	if (lQueue.l1_ready && lQueue.l2_ready)
		sendJoinResponse(t.game4.id, getFrontendBracket(tournamentId));
}
