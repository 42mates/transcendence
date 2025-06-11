import { tournaments, TournamentBracketBackend, onlineQueues} from "../game/state";
import { getUniqueGameId }                                    from "../utils";
import { InvalidNumberOfPlayers, WaitingForPlayers }          from "./exceptions";
import { GameInstance }                                       from "../pong/game.class";
import { sendJoinResponse }                                   from "./join";
import { User }                                               from "../join/User";
import { games }                                              from "../game/state";


export function tryMatchmakeLocal(players: User[]) {
	if (players.length !== 2)
		throw new InvalidNumberOfPlayers("local", players.length);

	const gameId = getUniqueGameId();
	games[gameId] = new GameInstance(players, gameId, "local", "pending");

	sendJoinResponse(gameId);
}

// 1v1 matchmaking
export function tryMatchmake1v1(user: User) {
	if (onlineQueues["1v1"].length < 2)
		throw new WaitingForPlayers(user);
	
	const [player1, player2] = onlineQueues["1v1"].splice(0, 2);
	const gameId = getUniqueGameId();

	games[gameId] = new GameInstance([player1, player2], gameId, "1v1", "pending");

	sendJoinResponse(gameId);
}

// Tournament matchmaking
export function tryMatchmakeTournament(user: User) {
	if (onlineQueues["tournament"].length < 4) 
		throw new WaitingForPlayers(user);	

	const players = onlineQueues["tournament"].splice(0, 4);
	const [p1, p2, p3, p4] = players;
	const gameId1 = getUniqueGameId();
	const gameId2 = getUniqueGameId();
	const gameId3 = getUniqueGameId();
	const gameId4 = getUniqueGameId();

	const tournamentId = getUniqueGameId();
	const backendBracket: TournamentBracketBackend = {
		tournamentId,
		game1: new GameInstance([p1, p2], gameId1, "tournament", "pending", tournamentId),
		game2: new GameInstance([p3, p4], gameId2, "tournament", "pending", tournamentId),
		game3: null,
		game4: null,
	};
	const frontendBracket = {
		id: tournamentId,
		game1: {
			id: gameId1,
			players: [p1.alias, p2.alias] as [string, string],
			status: "pending" as const,
		},
		game2: {
			id: gameId2,
			players: [p3.alias, p4.alias] as [string, string],
			status: "pending" as const,
		},
		game3: {
			id: gameId3,
			status: "waiting" as const,
		},
		game4: {
			id: gameId4,
			status: "waiting" as const,
		},
	};
	tournaments[tournamentId] = backendBracket;

	sendJoinResponse(gameId1, frontendBracket);
	sendJoinResponse(gameId2, frontendBracket);
}