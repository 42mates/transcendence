import type { JoinResponse } from "../types/messages";
import {
	games,
	tournaments,
	TournamentBracketBackend,
	matchmakingQueues,
} from "../game/state";
import { getUniqueGameId } from "../utils";
import { match } from "assert";

// 1v1 matchmaking
export function tryMatchmake1v1() {
	console.log("MATCHMAKING:", matchmakingQueues["1v1"]);
	if (matchmakingQueues["1v1"].length >= 2) {
		const [player1, player2] = matchmakingQueues["1v1"].splice(0, 2);
		const gameId = getUniqueGameId();

		const matchInfo: JoinResponse = {
			type: "join_response",
			status: "accepted",
			playerId: "1",
			alias: player1.alias,
			gameId,
			reason: null,
		};
		const matchInfo2: JoinResponse = {
			type: "join_response",
			status: "accepted",
			playerId: "2",
			alias: player2.alias,
			gameId,
			reason: null,
		};
		player1.send(matchInfo);
		player2.send(matchInfo2);

		games[gameId] = {
			id: gameId,
			players: [player1, player2],
			status: "pending",
		};
		console.log(games);
		return true;
	}
	return false;
}

// Tournament matchmaking
export function tryMatchmakeTournament() {
	if (matchmakingQueues["tournament"].length >= 4) {
		const players = matchmakingQueues["tournament"].splice(0, 4);
		const [p1, p2, p3, p4] = players;
		const gameId1 = getUniqueGameId();
		const gameId2 = getUniqueGameId();
		const gameId3 = getUniqueGameId();
		const gameId4 = getUniqueGameId();

		const tournamentId = getUniqueGameId();
		const backendBracket: TournamentBracketBackend = {
			tournamentId,
			game1: { id: gameId1, players: [p1, p2], status: "pending" },
			game2: { id: gameId2, players: [p3, p4], status: "pending" },
			game3: { id: gameId3, players: [], status: "waiting" },
			game4: { id: gameId4, players: [], status: "waiting" },
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
				players: ["winner_game1", "winner_game2"] as [string, string],
				status: "waiting" as const,
			},
			game4: {
				id: gameId4,
				players: ["loser_game1", "loser_game2"] as [string, string],
				status: "waiting" as const,
			},
		};
		tournaments[tournamentId] = backendBracket;

		players.forEach((p, idx) => {
			const response: JoinResponse = {
				type: "join_response",
				status: "accepted",
				playerId: idx % 2 === 0 ? "1" : "2",
				alias: p.alias,
				gameId: p === p1 || p === p2 ? gameId1 : gameId2,
				reason: null,
				bracket: frontendBracket,
			};
			p.send(response);
		});

		return true;
	}
	return false;
}