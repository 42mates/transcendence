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

		let paddleWidth = 5;
		let paddleHeight = 25;
		let paddleSpeed = 10;
		let ballSize = 2.5;
		let ballSpeed = 5;
		let wallOffset = 20;

		this.player1 = new Paddle(
			wallOffset,
			this.gameCanvas.height / 2 - paddleHeight / 2,
			paddleWidth,
			paddleHeight,
			paddleSpeed,
		);

		this.player2 = new Paddle(
			this.gameCanvas.width - (wallOffset + paddleWidth),
			this.gameCanvas.height / 2 - paddleHeight / 2,
			paddleWidth,
			paddleHeight,
			paddleSpeed,
		);

		this.ball = new Ball(
			this.gameCanvas.width / 2 - ballSize / 2,
			this.gameCanvas.height / 2 - ballSize / 2,
			ballSize,
			ballSize,
			ballSpeed,
		);
	}

	update() {
		this.player1.update(this.gameCanvas);
		this.player2.update(this.gameCanvas);
		this.ball.update(this.player1, this.player2, this.gameCanvas);
	}

	gameLoop() {
		this.update();
		requestAnimationFrame(this.gameLoop());
	}
}
