import { Ball } from "./ball.class.js";
import { KeyBinds } from "./keyBinds.js";
import { Paddle } from "./paddle.class.js";

export class Game {
	private gameCanvas;
	private gameContext;
	private static keysPressed: boolean[] = [];
	private player1: Paddle;
	private player2: Paddle;
	private ball: Ball;

	constructor() {
		this.gameCanvas = document.getElementById("game-canvas");
		this.gameContext = this.gameCanvas.getContext("2d");
		this.gameContext.font = "30px Orbitron";

		window.addEventListener("keydown", function (e) {
			Game.keysPressed[e.which] = true;
		});

		window.addEventListener("keyup", function (e) {
			Game.keysPressed[e.which] = false;
		});

		let paddleWidth = 20;
		let paddleHeight = 60;
		let paddleSpeed = 10;
		let ballSize = 10;
		let ballSpeed = 5;
		let wallOffset = 20;

		this.player1 = new Paddle(
			wallOffset,
			this.gameCanvas.height / 2 - paddleHeight / 2,
			paddleWidth,
			paddleHeight,
			paddleSpeed,
			KeyBinds.KEY_W,
			KeyBinds.KEY_S,
		);

		this.player2 = new Paddle(
			this.gameCanvas.width - (wallOffset + paddleWidth),
			this.gameCanvas.height / 2 - paddleHeight / 2,
			paddleWidth,
			paddleHeight,
			paddleSpeed,
			KeyBinds.UP,
			KeyBinds.DOWN,
		);

		this.ball = new Ball(
			this.gameCanvas.width / 2 - ballSize / 2,
			this.gameCanvas.height / 2 - ballSize / 2,
			ballSize,
			ballSize,
			ballSpeed,
		);
	}

	drawBoardDetails() {
		this.gameContext.strokeStyle = "#fff";
		this.gameContext.lineWidth = 5;
		this.gameContext.strokeRect(
			this.gameCanvas.width / 2 - 10,
			i + 10,
			15,
			20,
		);

		for (let i = 0; i + 30 < this.gameCanvas.height; i += 30) {
			this.gameContext.fillStyle = "#fff";
			this.gameContext.fillRect(
				this.gameCanvas.width / 2 - 10,
				i + 10,
				15,
				20,
			);
		}

		this.gameContext.fillText(Game.player1.score, 280, 50);
		this.gameContext.fillText(Game.player2.score, 390, 50);
	}

	update() {
		this.player1.update(this.gameCanvas);
		this.player2.update(this.gameCanvas);
		this.ball.update(this.player1, this.player2, this.gameCanvas);
	}

	draw() {
		this.gameContext.fillStyle = "#000";
		this.gameContext.fillRect(
			0,
			0,
			this.gameCanvas.width,
			this.gameCanvas.height,
		);

		this.drawBoardDetails();
		this.player1.draw(this.gameContext);
		this.player2.draw(this.gameContext);
		this.ball.draw(this.gameContext);
	}

	gameLoop() {
		this.update();
		this.draw();
		requestAnimationFrame(this.gameLoop());
	}
}
