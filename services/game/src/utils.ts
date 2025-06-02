import { games } from "./game/state";

 // Helper function for unique game IDs
export function getUniqueGameId(): string {
	let gameId: string;
	do {
		gameId = Math.random().toString(36).slice(2, 10);
	} while (games[gameId]);
	return gameId;
}
