import { games }        from "./game/state";
import { WebSocket }    from "ws";
import { FastifyReply } from 'fastify';

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
export function isValidGameId(id: string): boolean {
	return /^[a-z0-9]{8}$/.test(id);
}



export function send(connection: WebSocket | FastifyReply, msg: any, HTTPstatus: number = 200): void {
	if (connection instanceof WebSocket)
		connection.send(JSON.stringify(msg));
	else
		connection.status(HTTPstatus).send(JSON.stringify(msg));
}