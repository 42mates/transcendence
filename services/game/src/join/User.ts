import { WebSocket }    from "ws";
import { FastifyReply } from "fastify";
import type { JoinResponse, GameStateMessage, GameStatusUpdateMessage } from "../types/messages";

export class User {
	private _connection: WebSocket | FastifyReply;
	private _alias: string;
	private _gameMode: "1v1" | "tournament" | "local";
	private _status: "idle" | "queued" | "matched";

	constructor(
		connection: WebSocket | FastifyReply,
		alias: string,
		gameMode: "1v1" | "tournament" | "local",
		status: "idle" | "queued" | "matched"
	) {
		this._connection = connection;
		this._alias = alias;
		this._gameMode = gameMode;
		this._status = status;
	}

	get connection(): WebSocket | FastifyReply {
		return this._connection;
	}
	
	get alias(): string {
		return this._alias;
	}

	get gameMode(): "1v1" | "tournament" | "local" {
		return this._gameMode;
	}

	get status(): "idle" | "queued" | "matched" {
		return this._status;
	}

	send(msg: JoinResponse | GameStateMessage | GameStatusUpdateMessage, HTTPstatus: number = 200): void {
		if (this._connection instanceof WebSocket)
			this._connection.send(JSON.stringify(msg));
		else {
			if (msg.type !== "game_state") {
				// Handle join response and game status update messages
				this._connection.status(HTTPstatus).send(msg);
			}
			else {
				// Handle game state messages differently
			}
		}
	}
}
