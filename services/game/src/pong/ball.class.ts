import { Template } from "./template.class";
import { Paddle } from "./paddle.class";
import { GameCanvas } from "./gameCanvas.class";

export class Ball extends Template {
	private speed: number;

	constructor(x: number, y: number, h: number, w: number) {
		super(x, y, h, w);
		this.xVec = 1;
		this.yVec = -1;
		this.speed = 1;
	}

	update(player1: Paddle, player2: Paddle, gameCanvas: GameCanvas) {
		if (this.xVec > 0 && this.x + this.width + this.speed >= player2.x) {
			if (
				this.y + this.height >= player2.y &&
				this.y <= player2.y + player2.height
			) {
				this.xVec *= -1;
				// this.speed += 0.05;
			} else {
				player1.score += 1;
				this.x = gameCanvas.width / 2 - this.width / 2;
				this.y = gameCanvas.height / 2 - this.height / 2;
				this.xVec = 1;
				this.yVec = -1;
				// this.speed = 5;
			}
		} else if (
			this.xVec < 0 &&
			this.x - this.speed <= player1.x + player1.width
		) {
			if (this.y + this.height >= player1.y && this.y <= player1.y) {
				this.xVec *= -1;
				// this.speed += 0.05;
			}
			if (this.x - this.speed <= player1.width) {
				player2.score += 1;
				this.x = gameCanvas.width / 2 - this.width / 2;
				this.y = gameCanvas.height / 2 - this.height / 2;
				this.xVec = -1;
				this.yVec = -1;
				// this.speed = 5;
			}
		}
		if (
			this.yVec > 1 &&
			this.y + this.height + this.speed >= gameCanvas.height
		) {
			this.yVec *= -1;
			// this.speed += 0.05;
		} else if (this.yVec < 1 && this.y - this.speed <= 0) {
			this.yVec *= -1;
			// this.speed += 0.05;
		}

		this.x += this.xVec * this.speed;
		this.y += this.yVec * this.speed;
	}
}
