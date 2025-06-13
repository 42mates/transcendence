import { games }          from "./game/state";
import { WebSocket }      from "ws";
import { FastifyReply }   from 'fastify';
import { User }           from "./join/User";
import { sanitizeAlias }  from "./join/alias";
import { connectedUsers } from "./game/state";

export function getUniqueGameId(): string {
	let gameId: string;
	do {
		gameId = Math.random().toString(36).slice(2, 10);
	} while (games[gameId]);
	return gameId;
}

/**
 * Checks if the provided game ID is exactly 8 lowercase alphanumeric characters (a-z, 0-9).
 */
export function isValidGameId(id: string | undefined): boolean {
	if (id === undefined) return false;
	return (/^[a-z0-9]{8}$/.test(id));
}

export function isValidAvatar(url: string): boolean {
	if (!url) return false;
	if (url.startsWith("/assets/")) return true;
	if (url.startsWith("http://") || url.startsWith("https://")) return true;
	return false;
}

export function send(connection: WebSocket | FastifyReply, msg: any, HTTPstatus: number = 200): void {
	if (connection instanceof WebSocket)
		connection.send(JSON.stringify(msg));
	else
		connection.status(HTTPstatus).send(JSON.stringify(msg));
}

export function getUser(alias: string): User | undefined {
	if (!sanitizeAlias(alias))
		return undefined;
	return Object.values(connectedUsers).find(user => user.alias === alias);
}
