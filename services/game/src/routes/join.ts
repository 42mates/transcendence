import { WebSocket } from "ws";
import type { JoinRequest, JoinResponse } from "../types/GameMessages";
import { connectedUsers, matchmakingQueues, games, ConnectedUser } from "../server";

// Alias sanitization/validation
export function sanitizeAlias(alias: string): string | null {
	if (typeof alias !== "string") return null;
	const trimmed = alias.trim();
	if (trimmed.length < 3 || trimmed.length > 30) return null;
	if (!/^[a-zA-Z0-9_\-]+$/.test(trimmed)) return null;
	return trimmed;
}

type TournamentBracket = {
    game1: { id: string, players: [string, string], status: "pending" | "finished", winner?: string, loser?: string },
    game2: { id: string, players: [string, string], status: "pending" | "finished", winner?: string, loser?: string },
    game3: { id: string, players: [string, string], status: "pending" | "waiting" | "finished", winner?: string, loser?: string },
    game4: { id: string, players: [string, string], status: "pending" | "waiting" | "finished", winner?: string, loser?: string }
};

export default function join(wsSocket: WebSocket, message: JoinRequest) {
	console.log("Join message received:", message);

	const { alias, mode } = message.payload;
	const cleanAlias = sanitizeAlias(alias);

	// Validate alias
	if (!cleanAlias) {
		const response: JoinResponse = {
			type: "join_response",
			status: "rejected",
			playerId: null,
			gameId: null,
			reason: "Invalid alias",
		};
		wsSocket.send(JSON.stringify(response));
		return;
	}
	if (connectedUsers.some(u => u.alias === cleanAlias)) {
		const response: JoinResponse = {
			type: "join_response",
			status: "rejected",
			playerId: null,
			gameId: null,
			reason: "Alias already in use",
		};
		wsSocket.send(JSON.stringify(response));
		return;
	}

	// Save user
	const user: ConnectedUser = {
		alias: cleanAlias,
		ws: wsSocket,
		gameMode: mode,
		status: "queued",
	};
	connectedUsers.push(user);

	if (mode === "1v1" || mode === "tournament") {
		matchmakingQueues[mode].push(user);

		// Try to matchmake (for 1v1)
		if (mode === "1v1" && matchmakingQueues["1v1"].length >= 2) {
			const [player1, player2] = matchmakingQueues["1v1"].splice(0, 2);
			const gameId = getUniqueGameId();

			player1.status = "matched";
			player2.status = "matched";

			const matchInfo: JoinResponse = {
				type: "join_response",
				status: "accepted",
				playerId: player1.alias,
				gameId,
				reason: null,
			};
			const matchInfo2: JoinResponse = {
				type: "join_response",
				status: "accepted",
				playerId: player2.alias,
				gameId,
				reason: null,
			};
			player1.ws.send(JSON.stringify(matchInfo));
			player2.ws.send(JSON.stringify(matchInfo2));

			// Register the game
			games[gameId] = { players: [player1.alias, player2.alias] };

			return;
		} else if (mode === "tournament" && matchmakingQueues["tournament"].length >= 4) {
			const players = matchmakingQueues["tournament"].splice(0, 4);
			const [p1, p2, p3, p4] = players;
			const gameId1 = getUniqueGameId();
			const gameId2 = getUniqueGameId();
			const gameId3 = getUniqueGameId();
			const gameId4 = getUniqueGameId();

			// Register initial games
			games[gameId1] = { players: [p1.alias, p2.alias] };
			games[gameId2] = { players: [p3.alias, p4.alias] };

			// Build bracket info
			const bracket = {
				game1: { id: gameId1, players: [p1.alias, p2.alias] as [string, string], status: "pending" as const },
				game2: { id: gameId2, players: [p3.alias, p4.alias] as [string, string], status: "pending" as const },
				game3: { id: gameId3, players: ["winner_game1", "winner_game2"] as [string, string], status: "waiting" as const },
				game4: { id: gameId4, players: ["loser_game1", "loser_game2"] as [string, string], status: "waiting" as const }
			};

			// Send join_response with bracket to all 4 players
			for (const p of players) {
				const response: JoinResponse = {
					type: "join_response",
					status: "accepted",
					playerId: p.alias,
					gameId: p === p1 || p === p2 ? gameId1 : gameId2,
					reason: null,
					bracket: bracket,
				};
				p.ws.send(JSON.stringify(response));
			}

			return;
		}
	} else if (mode === "local") {
		const gameId = getUniqueGameId();

		const response: JoinResponse = {
			type: "join_response",
			status: "accepted",
			playerId: cleanAlias,
			gameId,
			reason: null,
		};
		wsSocket.send(JSON.stringify(response));

		// Register the game
		games[gameId] = { players: [cleanAlias] };
		return;
	}

	// If not matched yet, just acknowledge join
	const response: JoinResponse = {
		type: "join_response",
		status: "accepted",
		playerId: cleanAlias,
		gameId: null,
		reason: null,
	};
	wsSocket.send(JSON.stringify(response));
}

// Helper function for unique game IDs
function getUniqueGameId(): string {
    let gameId: string;
    do {
        gameId = Math.random().toString(36).slice(2, 10);
    } while (games[gameId]);
    return gameId;
}
