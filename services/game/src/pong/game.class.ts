import { Ball }       from "./ball.class";
import { Paddle }     from "./paddle.class";
import { GameCanvas } from "./gameCanvas.class";
import { User }       from "../join/User";
import {
	GameStateMessage,
	GameUpdateMessage,
}                     from "../types/messages";
import { tournaments } from "../game/state";

export class GameInstance {
	private _gameCanvas: GameCanvas;
	private _id: string;
	private _mode: "1v1" | "tournament" | "local" = "1v1";
	private _status: "pending" | "waiting" | "running" | "ended";
	private _tournamentId?: string = undefined;
	private _players: User[];
	private _player1: Paddle;
	private _player2: Paddle;
	private _ball: Ball;
	public  _inputs: { up: boolean; down: boolean }[];
	private _winner?: User;
	private _loser?: User;

	constructor(
		players: User[],
		id: string,
		mode: "1v1" | "tournament" | "local" = "1v1",
		status: "pending" | "waiting" = "pending",
		tournamentId?: string
	) {
		this._gameCanvas = new GameCanvas(100, 75);

		this._players = players;

		this._player1 = new Paddle(
			0,
			this._gameCanvas.height / 2 - this._gameCanvas.paddleHeight / 2,
			this._gameCanvas.paddleWidth,
			this._gameCanvas.paddleHeight,
			this._players[0],
		);

		this._player2 = new Paddle(
			this._gameCanvas.width - this._gameCanvas.paddleWidth,
			this._gameCanvas.height / 2 - this._gameCanvas.paddleHeight / 2,
			this._gameCanvas.paddleWidth,
			this._gameCanvas.paddleHeight,
			this._players[1],
		);

		this._ball = new Ball(
			this._gameCanvas.width / 2 - this._gameCanvas.ballSize / 2,
			this._gameCanvas.height / 2 - this._gameCanvas.ballSize / 2,
			this._gameCanvas.ballSize,
			this._gameCanvas.ballSize,
		);

		this._inputs = [
			{ up: false, down: false }, // Player 1
			{ up: false, down: false }, // Player 2
		];

		this._id = id;
		this._mode = mode;
		this._status = status;
		this._tournamentId = tournamentId;
	}

	public get players() { return this._players;}
	public get id() { return this._id;}
	public get mode() { return this._mode;}
	public get status() { return this._status;}
	public get tournamentId() { return this._tournamentId;}
	public get score() { return [this._player1.score, this._player2.score];}
	public get dimensions() { return this._gameCanvas.dimensions;}
	public get winner(): User | undefined { return this._winner;}
	public get loser(): User | undefined { return this._loser;}

	public run() {
		this._status = "running";

		this.gameLoop();
	}

	updateInputs() {
		this._player1.up = this._inputs[0].up;
		this._player1.down = this._inputs[0].down;
		this._player2.up = this._inputs[1].up;
		this._player2.down = this._inputs[1].down;
	}

	update() {
		this.updateInputs();
		this._player1.update(this._gameCanvas);
		this._player2.update(this._gameCanvas);
		this._ball.update(this._player1, this._player2, this._gameCanvas);
		//if (this._player1.score >= 11 || this._player2.score >= 11) {
		//	this.end(
		//		this._player1.score >= 11 ? this._player1.user : this._player2.user,
		//		this._player1.score >= 11 ? this._player2.user : this._player1.user,
		//	);
		//}
		if (this._player1.score >= 2 || this._player2.score >= 2) {
			this.end(
				this._player1.score >= 2 ? this._player1.user : this._player2.user,
				this._player1.score >= 2 ? this._player2.user : this._player1.user,
			);
		}
	}

	public getState(): GameStateMessage {
		return {
			type: "game_state",
			ball: { x: this._ball.x, y: this._ball.y },
			paddles: [
				{ x: this._player1.x, y: this._player1.y },
				{ x: this._player2.x, y: this._player2.y },
			],
			score: [this._player1.score, this._player2.score],
			status: this._status,
		};
	}

	sendUpdate() {
		const response: GameStateMessage = this.getState();
		this._player1.user.send(response);
		this._player2.user.send(response);
	}

	gameLoop() {
		if (this._status !== "running") return;
		this.update();
		this.sendUpdate();
		if (this._status == "running") {
			setTimeout(() => this.gameLoop(), 1000 / 60); // ~60 FPS
		}
	}

	public quit(user: User) {
		if (this._status === "ended") return;

		console.log("User quit:", user.alias);
		user.status = "quit";

		if (user === this._player1.user)
			this.end(this._player2.user, user);
		else if (user === this._player2.user)
			this.end(this._player1.user, user);
		else
			console.error("User not found in game:", user.alias);
	}

	public end(winner: User, loser: User) {
		this._status = "ended";
		this._winner = winner;
		this._loser = loser;

		console.log("Game ended. Winner:", winner.alias, "Loser:", loser.alias);

	
		const msg: GameUpdateMessage = {
			type: "game_update",
			gameId: this._id,
			status: this._status,
			score: [this._player1.score, this._player2.score],
			winner: winner.alias,
			loser: loser.alias,
		};

		this._player1.user.send(msg);
		this._player2.user.send(msg);

		if (this._tournamentId && tournaments[this._tournamentId])
			tournaments[this._tournamentId].update();
		else if (this._mode === "tournament")
			throw new Error("Couldn't update tournament: Tournament ID not found.");
	}
}
