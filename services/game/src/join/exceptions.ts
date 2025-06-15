import type { JoinResponse } from "../types/messages";

import { User } from "./User";

export class InvalidNumberOfPlayers extends Error {
	response: JoinResponse;
	constructor(mode: "1v1" | "tournament" | "local" , received: number) {
		const expected = mode === "local" ? 2 : 1;
		const message = `Invalid number of players: expected ${expected}, received ${received}.`;
		super(message);
		this.name = "InvalidNumberOfPlayers";
		this.response = {
			type: "join_response",
			status: "rejected",
			aliases: null,
			playerId: null,
			gameId: null,
			reason: message,
		};
	}
}

export class WaitingForPlayers extends Error {
	response: JoinResponse;
	constructor(user: User, gameId?: string) {
		const message = "Waiting for more players to join.";
		super(message);
		this.name = "WaitingForPlayers";
		this.response = {
			type: "join_response",
			status: "waiting",
			aliases: [user.alias],
			playerId: null,
			gameId: gameId ?? null,
			reason: message,
			avatar: [user.avatar]
		};
	}
}
export class InvalidAlias extends Error {
	response: JoinResponse;
	constructor(error: Error, alias: string) {
		const message = error.message || "Invalid alias (default error message)";
		super(message);
		this.name = "InvalidAlias";
		this.response = {
			type: "join_response",
			status: "rejected",
			aliases: [alias],
			playerId: null,
			gameId: null,
			reason: message,
		};
	}
}

export class TournamentNotFound extends Error {
	response: JoinResponse;
	constructor(user: User, tournamentId: string | null) {
		const message = `Tournament not found: ${tournamentId}`;
		super(message);
		this.name = "TournamentNotFound";
		this.response = {
			type: "join_response",
			status: "rejected",
			aliases: [user.alias],
			playerId: null,
			gameId: null,
			reason: message,
			avatar: [user.avatar]
		};
	}
}