import { games }		  from "./game/state";
import { WebSocket }	  from "ws";
import { FastifyReply }   from 'fastify';
import { User }		   from "./join/User";
import { sanitizeAlias }  from "./join/alias";
import { connectedUsers } from "./game/state";

export function getUniqueGameId(): string {
	let gameId: string;
	do {
		gameId = Math.random().toString(36).slice(2, 10);
	} while (games[gameId]);
	return gameId;
}

export function isValidGameId(id: string | undefined): boolean {
	if (id === undefined) return false;
	return (/^[a-z0-9]{8}$/.test(id));
}

export function isValidAvatar(url: string): boolean {
	if (!url) return false;

	// Disallow dangerous schemes
	if (/^(javascript|data|vbscript):/i.test(url.trim())) return false;

	// Allow local assets
	if (url.startsWith("/assets/")) return true;

	// Allow Google profile pictures
	if (/^https:\/\/lh3\.googleusercontent\.com\//.test(url)) return true;

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
