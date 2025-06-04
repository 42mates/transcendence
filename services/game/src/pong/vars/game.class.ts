import { Ball }       from "./ball.class";
import { Paddle }     from "./paddle.class";
import { GameCanvas } from "./gameCanvas.class";
import { User }       from "../../join/User";
import { GameStateMessage, PlayerInputMessage, GameStatusUpdateMessage } from "../../types/messages";

export class GameInstance {
	private _gameCanvas: GameCanvas;
	private _id: string;
	private _players: User[];
	private _player1: Paddle;
	private _player2: Paddle;
	private _ball: Ball;
	private _status: "pending" | "waiting" | "running" | "ended";
	private _winner?: User;
	private _loser?: User;

	constructor(players: User[], id: string, status: "pending" | "waiting" = "pending") {
		let canvasWidth = 100;
		let canvasHeight = 100;
		let wallOffset = canvasWidth / 10;

		let paddleWidth = canvasWidth / 20;
		let paddleHeight = canvasHeight / 5;

		let ballSize = canvasWidth / 50;

		this._gameCanvas = new GameCanvas(canvasWidth, canvasHeight);

		this._players = players;
		this._player1 = new Paddle(
			wallOffset,
			this._gameCanvas.height / 2 - paddleHeight / 2,
			paddleWidth,
			paddleHeight,
			players[0],
		);

		this._player2 = new Paddle(
			this._gameCanvas.width - (wallOffset + paddleWidth),
			this._gameCanvas.height / 2 - paddleHeight / 2,
			paddleWidth,
			paddleHeight,
			players[1],
		);

		this._ball = new Ball(
			this._gameCanvas.width / 2 - ballSize / 2,
			this._gameCanvas.height / 2 - ballSize / 2,
			ballSize,
			ballSize,
		);

		this._id = id;
		this._status = status;
	}

	public get players() {
		return this._players;
	}

	public get gameId() {
		return this._id;
	}

	public get status() {
		return this._status;
	}

	public run()
	{
		this._status = "running";
		//const msg: GameStatusUpdateMessage = {
		//	type: "game_status_update",
		//	gameId: this._id,
		//	status: this._status,
		//	winner: this._winner?.alias,
		//	loser: this._loser?.alias,
		//};
		//this._player1.user.send(msg);
		//this._player2.user.send(msg);
		
		
		this.gameLoop();

		console.log("Game started with players:", this._player1.user.alias, "and", this._player2.user.alias);
	}

	receivedInputs(playersInput: PlayerInputMessage["input"][]) {
		this._player1.up = playersInput[0].up;
		this._player1.down = playersInput[0].down;
		this._player2.up = playersInput[1].up;
		this._player2.down = playersInput[1].down;
	}

	update() {
		this._player1.update(this._gameCanvas);
		this._player2.update(this._gameCanvas);
		this._ball.update(this._player1, this._player2, this._gameCanvas);
		if (this._player1.score >= 11 || this._player2.score >= 11) {
			this._status = "ended";
		}
	}

	sendUpdate() {
		const response: GameStateMessage = {
			type: "game_state",
			ball: { x: this._ball.x, y: this._ball.y },
			paddles: [
				{ x: this._player1.x, y: this._player1.y },
				{ x: this._player2.x, y: this._player2.y },
			],
			score: [this._player1.score, this._player2.score],
			status: this._status,
		};
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

	end(winner: User, loser: User) {
		this._status = "ended";
		this._winner = winner;
		this._loser = loser;

		const msg: GameStatusUpdateMessage = {
			type: "game_status_update",
			gameId: this._id,
			status: this._status,
			winner: this._winner.alias,
			loser: this._loser.alias,
		};
		this._player1.user.send(msg);
		this._player2.user.send(msg);

		console.log("Game ended. Winner:", winner.alias, "Loser:", loser.alias);
	}
}
