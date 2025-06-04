import { Ball } from "./ball.class.js";
import { Paddle } from "./paddle.class.js";
import { GameCanvas } from "./gameCanvas.class.js";
import { User } from "../../join/User.js";
import { GameStateMessage, PlayerInputMessage, GameStatusUpdateMessage } from "../../types/messages.js";

export class GameInstance {
	private gameCanvas: GameCanvas;
	private id: string;
	private player1: Paddle;
	private player2: Paddle;
	private ball: Ball;
	status: "pending" | "waiting" | "running" | "ended";
	private winner?: User;
	private loser?: User;

	constructor(players: User[], id: string) {
		let canvasWidth = 100;
		let canvasHeight = 100;
		let wallOffset = canvasWidth / 10;

		let paddleWidth = canvasWidth / 20;
		let paddleHeight = canvasHeight / 5;

		let ballSize = canvasWidth / 50;

		this.gameCanvas = new GameCanvas(canvasWidth, canvasHeight);

		this.player1 = new Paddle(
			wallOffset,
			this.gameCanvas.height / 2 - paddleHeight / 2,
			paddleWidth,
			paddleHeight,
			players[0],
		);

		this.player2 = new Paddle(
			this.gameCanvas.width - (wallOffset + paddleWidth),
			this.gameCanvas.height / 2 - paddleHeight / 2,
			paddleWidth,
			paddleHeight,
			players[1],
		);

		this.ball = new Ball(
			this.gameCanvas.width / 2 - ballSize / 2,
			this.gameCanvas.height / 2 - ballSize / 2,
			ballSize,
			ballSize,
		);

		this.id = id;
		this.status = "pending";
	}

	public start()
	{
		this.status = "running";
		const msg: GameStatusUpdateMessage = {
			type: "game_status_update",
			gameId: this.id,
			status: this.status,
			winner: this.winner?.alias,
			loser: this.loser?.alias,
		};
		this.player1.user.send(msg);
		this.player2.user.send(msg);
		//this.gameLoop();

		//console.log("Game started with players:", this.player1.user.alias, "and", this.player2.user.alias);
	}

	receivedInputs(playerInputMessage: PlayerInputMessage[]) {
		this.player1.up = playerInputMessage[0].input.up;
		this.player1.down = playerInputMessage[0].input.down;
		this.player2.up = playerInputMessage[1].input.up;
		this.player2.down = playerInputMessage[1].input.down;
	}

	update() {
		this.player1.update(this.gameCanvas);
		this.player2.update(this.gameCanvas);
		this.ball.update(this.player1, this.player2, this.gameCanvas);
		if (this.player1.score >= 11 || this.player2.score >= 11) {
			this.status = "ended";
		}
	}

	sendUpdate() {
		const response: GameStateMessage = {
			type: "game_state",
			ball: { x: this.ball.x, y: this.ball.y },
			paddles: [
				{ x: this.player1.x, y: this.player1.y },
				{ x: this.player2.x, y: this.player2.y },
			],
			score: [this.player1.score, this.player2.score],
			status: this.status,
		};
		this.player1.user.send(response);
		this.player2.user.send(response);
	}

	gameLoop() {
		this.update();
		this.sendUpdate();
		if (this.status == "running") {
			requestAnimationFrame(this.gameLoop);
		}
	}
}
