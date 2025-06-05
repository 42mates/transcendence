import { tournaments, TournamentBracketBackend, onlineQueues} from "../game/state";
import { getUniqueGameId }                                         from "../utils";
import { WaitingForPlayers }                                       from "./exceptions";
import { GameInstance }                                            from "../pong/vars/game.class";
import { joinGame }                                                from "./join";
import { User }                                                    from "../join/User";


// 1v1 matchmaking
export function tryMatchmake1v1(user: User) {
	if (onlineQueues["1v1"].length < 2)
		throw new WaitingForPlayers(user);
	
	const [player1, player2] = onlineQueues["1v1"].splice(0, 2);
	const gameId = getUniqueGameId();

	joinGame([player1, player2], gameId);
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
		game1: new GameInstance([p1, p2], gameId1, "pending"),
		game2: new GameInstance([p3, p4], gameId2, "pending"),
		game3: null,
		game4: null,
	};
	const frontendBracket = {
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

	joinGame([p1, p2], gameId1, frontendBracket);
	joinGame([p3, p4], gameId2, frontendBracket);
}