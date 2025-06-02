import { WebSocket } from "ws";
import type { JoinRequest, JoinResponse } from "../types/GameMessages";
import { connectedUsers } from "../game/state";


export function sanitizeAlias(alias: string): string | null {
	if (typeof alias !== "string") return null;
	const trimmed = alias.trim();
	if (trimmed.length < 3 || trimmed.length > 30) return null;
	if (!/^[a-zA-Z0-9_\-]+$/.test(trimmed)) return null;
	return trimmed;
}

export function validateAlias(
	wsSocket: WebSocket,
	message: JoinRequest
): string | null {
	const { alias, mode } = message.payload;
	const cleanAlias = sanitizeAlias(alias);

	// Validate alias
	if (!cleanAlias) {
		const response: JoinResponse = {
			type: "join_response",
			status: "rejected",
			alias: alias,
			playerId: null,
			gameId: null,
			reason: "Invalid alias",
		};
		wsSocket.send(JSON.stringify(response));
		return null;
	}
	if (mode !== "local" && connectedUsers.some(u => u.alias === cleanAlias)) {
		const response: JoinResponse = {
			type: "join_response",
			status: "rejected",
			alias: alias,
			playerId: null,
			gameId: null,
			reason: "Alias already in use",
		};
		wsSocket.send(JSON.stringify(response));
		return null;
	}
	return cleanAlias;
}