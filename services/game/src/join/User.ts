import { WebSocket }    from "ws";
import { FastifyReply } from "fastify";
import type { JoinResponse, GameStateMessage, GameStatusUpdateMessage } from "../types/messages";

export class User {
	private _connection: WebSocket | FastifyReply;
	private _alias: string;
	private _avatar: string;
	private _gameMode: "1v1" | "tournament" | "local";
	private _playerId: "1" | "2";
	private _status: "idle" | "queued" | "matched";

	constructor(
		connection: WebSocket | FastifyReply,
		alias: string,
		avatar: string =  "/assets/default_avatar1.png",
		gameMode: "1v1" | "tournament" | "local",
		playerId: "1" | "2",
		status: "idle" | "queued" | "matched"
	) {
		this._connection = connection;
		this._alias = alias;
		this._avatar = avatar;
		this._playerId = playerId;
		this._gameMode = gameMode;
		this._status = status;
	}

	get connection(): WebSocket | FastifyReply {
		return this._connection;
	}
	
	get alias(): string {
		return this._alias;
	}

	get avatar(): string {
		return this._avatar;
	}

	get gameMode(): "1v1" | "tournament" | "local" {
		return this._gameMode;
	}

	get playerId(): "1" | "2"{
		return this._playerId;
	}

	set playerId(value: "1" | "2") {
		if (value !== "1" && value !== "2")
			throw new Error("Invalid playerId. Must be '1' or '2'.");
		this._playerId = value;
	}

	get status(): "idle" | "queued" | "matched" {
		return this._status;
	}

	set status(value: "idle" | "queued" | "matched") {
		if (value !== "idle" && value !== "queued" && value !== "matched")
			throw new Error("Invalid status. Must be 'idle', 'queued', or 'matched'.");
		this._status = value;
	}

	send(msg: JoinResponse | GameStateMessage | GameStatusUpdateMessage, HTTPstatus: number = 200): void {
		if (this._gameMode === "local" && this._playerId === "2") return;

		if (this._connection instanceof WebSocket)
			this._connection.send(JSON.stringify(msg));
		else {
			if (msg.type !== "game_state") {
				// Handle join response and game status update messages
				this._connection.status(HTTPstatus).send(msg);
			}
			else {
				// Handle game state messages differently
				console.warn("How to handle game state messages in HTTP responses?");
			}
		}
	}
}
