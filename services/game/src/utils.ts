import { games } from "./game/state";

export function sanitizeAlias(alias: string): string | null {
	if (typeof alias !== "string") return null;
	const trimmed = alias.trim();
	if (trimmed.length < 3 || trimmed.length > 30) return null;
	if (!/^[a-zA-Z0-9_\-]+$/.test(trimmed)) return null;
	return trimmed;
}
 // Helper function for unique game IDs
export function getUniqueGameId(): string {
	let gameId: string;
	do {
		gameId = Math.random().toString(36).slice(2, 10);
	} while (games[gameId]);
	return gameId;
}
