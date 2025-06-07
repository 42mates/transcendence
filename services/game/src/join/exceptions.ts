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
			alias: null,
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
			alias: user.alias,
			playerId: null,
			gameId: gameId ?? null,
			reason: message,
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
			alias: alias,
			playerId: null,
			gameId: null,
			reason: message,
		};
	}
}
