import { Template } from "./template.class";
import { Paddle } from "./paddle.class";
import { GameCanvas } from "./gameCanvas.class";

export class Ball extends Template {
	private speed: number;
	private pauseUntil: number | null = null; // timestamp en ms

	constructor(x: number, y: number, h: number, w: number) {
		super(x, y, h, w);
		this.xVec = 1;
		this.yVec = -1;
		this.speed = 1;
	}

	update(player1: Paddle, player2: Paddle, gameCanvas: GameCanvas) {
		if (this.pauseUntil !== null && Date.now() < this.pauseUntil) {
			return; // Pause the ball movement
		}
		this.pauseUntil = null; // Reset pause

		if (
			this.xVec > 0 &&
			this.x + this.width + this.speed >= gameCanvas.width
		) {
			if (
				this.y + this.height >= player2.y &&
				this.y <= player2.y + player2.height
			) {
				this.xVec *= -1;
			} else {
				player1.score += 1;
				this.x = gameCanvas.width / 2 - this.width / 2;
				this.y = gameCanvas.height / 2 - this.height / 2;
				this.xVec = 1;
				this.yVec = -1;
				this.pauseUntil = Date.now() + 500; // pause 0.5s
				return;
			}
		} else if (this.xVec < 0 && this.x - this.speed <= 0) {
			if (
				this.y + this.height >= player1.y &&
				this.y <= player1.y + player2.height
			) {
				this.xVec *= -1;
			} else {
				player2.score += 1;
				this.x = gameCanvas.width / 2 - this.width / 2;
				this.y = gameCanvas.height / 2 - this.height / 2;
				this.xVec = -1;
				this.yVec = -1;
				this.pauseUntil = Date.now() + 500; // pause 0.5s
				return;
			}
		}

		if (
			this.yVec > 0 &&
			this.y + this.height + this.speed >= gameCanvas.height
		) {
			this.yVec *= -1;
		} else if (this.yVec < 0 && this.y - this.speed <= 0) {
			this.yVec *= -1;
		}

		this.x += this.speed * this.xVec;
		this.y += this.speed * this.yVec;
	}
}
