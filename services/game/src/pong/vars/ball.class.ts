import { Template } from "./template.class.js";
import { Paddle } from "./paddle.class.js";
import { GameCanvas } from "./gameCanvas.class.js";

export class Ball extends Template {
	private speed: number;

	constructor(x: number, y: number, h: number, w: number) {
		super(x, y, h, w);
		this.xVec = 1;
		this.yVec = -1;
		this.speed = 5;
	}

	update(player1: Paddle, player2: Paddle, gameCanvas: GameCanvas) {
		if (this.xVec > 0) {
			if (
				this.x + this.width + this.speed >= player2.x &&
				this.y >= player2.y &&
				this.y <= player2.y
			) {
				this.xVec *= -1;
			}
			if (this.yVec > 1) {
				if (this.y + this.height + this.speed >= gameCanvas.height) {
					this.yVec *= -1;
				}
			} else {
				if (this.y - this.speed <= gameCanvas.height) {
					this.yVec *= -1;
				}
			}
			if (this.x + this.width + this.speed >= gameCanvas.width) {
				player1.score += 1;
				this.x = gameCanvas.width / 2 - this.width / 2;
				this.y = gameCanvas.height / 2 - this.height / 2;
				this.xVec = 1;
				this.yVec = -1;
			}
		} else {
			if (
				this.x - this.speed <= player1.x + player1.width &&
				this.y >= player1.y &&
				this.y <= player1.y
			) {
				this.xVec *= -1;
			}
			if (this.yVec > 1) {
				if (this.y + this.height + this.speed >= gameCanvas.height) {
					this.yVec *= -1;
				}
			} else {
				if (this.y - this.speed <= gameCanvas.height) {
					this.yVec *= -1;
				}
			}
			if (this.x - this.speed <= 0) {
				player2.score += 1;
				this.x = gameCanvas.width / 2 - this.width / 2;
				this.y = gameCanvas.height / 2 - this.height / 2;
				this.xVec = -1;
				this.yVec = -1;
			}
		}

		this.x += this.xVec * this.speed;
		this.y += this.yVec * this.speed;
	}
}
