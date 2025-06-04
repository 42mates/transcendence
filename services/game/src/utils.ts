import { games }        from "./game/state";
import { WebSocket }    from "ws";
import { FastifyReply } from 'fastify';
	
 // Helper function for unique game IDs
export function getUniqueGameId(): string {
	let gameId: string;
	do {
		gameId = Math.random().toString(36).slice(2, 10);
	} while (games[gameId]);
	return gameId;
}

export function send(connection: WebSocket | FastifyReply, msg: any, HTTPstatus: number = 200): void {
	if (connection instanceof WebSocket)
		connection.send(JSON.stringify(msg));
	else
		connection.status(HTTPstatus).send(JSON.stringify(msg));
}