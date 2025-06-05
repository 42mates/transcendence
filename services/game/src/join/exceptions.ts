import type { JoinResponse } from "../types/messages";

import { User } from "./User";


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
	constructor(error: Error) {
		const message = error.message || "Invalid alias (default error message)";
		super(message);
		this.name = "InvalidAlias";
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