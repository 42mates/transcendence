import { Ball } from "./ball.class.js";
import { Paddle } from "./paddle.class.js";
import { GameCanvas } from "./gameCanvas.class.js";

export class Game {
	private gameCanvas: GameCanvas;
	private player1: Paddle;
	private player2: Paddle;
	private ball: Ball;

	constructor() {
		this.gameCanvas = new GameCanvas(100, 100);

		let paddleWidth = this.gameCanvas.width / 20;
		let paddleHeight = this.gameCanvas.height / 5;
		let ballSize = this.gameCanvas.height / 50;
		let wallOffset = this.gameCanvas.width / 10;

		this.player1 = new Paddle(
			wallOffset,
			this.gameCanvas.height / 2 - paddleHeight / 2,
			paddleWidth,
			paddleHeight,
		);

		this.player2 = new Paddle(
			this.gameCanvas.width - (wallOffset + paddleWidth),
			this.gameCanvas.height / 2 - paddleHeight / 2,
			paddleWidth,
			paddleHeight,
		);

		this.ball = new Ball(
			this.gameCanvas.width / 2 - ballSize / 2,
			this.gameCanvas.height / 2 - ballSize / 2,
			ballSize,
			ballSize,
		);
	}

	update() {
		this.player1.update(this.gameCanvas);
		this.player2.update(this.gameCanvas);
		this.ball.update(this.player1, this.player2, this.gameCanvas);
	}

	gameLoop() {
		this.update();
		requestAnimationFrame(this.gameLoop);
	}
}
