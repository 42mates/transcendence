import type { JoinRequest } from "../types/messages";
import { connectedUsers } from "../game/state";


export function sanitizeAlias(alias: string): string | null {
	if (typeof alias !== "string") return null;
	const trimmed = alias.trim();
	if (trimmed.length < 3 || trimmed.length > 30) return null;
	if (!/^[a-zA-Z0-9_\-]+$/.test(trimmed)) return null;
	return trimmed;
}

export function validateAlias(
	message: JoinRequest
): string {
	const { alias, mode } = message.payload;
	const cleanAlias = sanitizeAlias(alias);

	if (!cleanAlias)
		throw new Error("Invalid alias");
	if (mode !== "local" && connectedUsers.some(u => u.alias === cleanAlias))
		throw new Error("Alias already in use");

	return cleanAlias;
}