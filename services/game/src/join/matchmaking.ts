import { tournaments, onlineQueues}                  from "../game/state";
import { getUniqueGameId }                           from "../utils";
import { InvalidNumberOfPlayers,
		 WaitingForPlayers,
		TournamentNotFound }                         from "./exceptions";
import { GameInstance }                              from "../pong/game.class";
import { sendJoinResponse }                          from "./join";
import { User }                                      from "../join/User";
import { games }                                     from "../game/state";
import { createTournament, getFrontendBracket }      from "./tournament";


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

	const frontendBracket = getFrontendBracket(tournamentId);
	sendJoinResponse(t.game3.id, frontendBracket);
	sendJoinResponse(t.game4.id, frontendBracket);
}

