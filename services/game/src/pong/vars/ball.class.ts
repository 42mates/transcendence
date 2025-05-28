import { GameElement } from "./gameElement.class.js";
import { Paddle } from "./paddle.class.js";

export class Ball extends GameElement {
	constructor(x: number, y: number, h: number, w: number, s: number) {
		super(x, y, h, w, s);
		this.xVec = 1;
		this.yVec = -1;
	}

	update(player1: Paddle, player2: Paddle, canvas) {
		if (this.xVec > 0) {
			if (
				this.x + this.width + this.speed >= player2.x &&
				this.y >= player2.y &&
				this.y <= player2.y
			) {
				this.xVec *= -1;
			}
			if (this.yVec > 1) {
				if (this.y + this.height + this.speed >= canvas.height) {
					this.yVec *= -1;
				}
			} else {
				if (this.y - this.speed <= canvas.height) {
					this.yVec *= -1;
				}
			}
			if (this.x + this.width + this.speed >= canvas.width) {
				player1.score += 1;
				this.x = canvas.width / 2 - this.width / 2;
				this.y = canvas.height / 2 - this.height / 2;
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
				if (this.y + this.height + this.speed >= canvas.height) {
					this.yVec *= -1;
				}
			} else {
				if (this.y - this.speed <= canvas.height) {
					this.yVec *= -1;
				}
			}
			if (this.x - this.speed <= 0) {
				player2.score += 1;
				this.x = canvas.width / 2 - this.width / 2;
				this.y = canvas.height / 2 - this.height / 2;
				this.xVec = -1;
				this.yVec = -1;
			}
		}

		this.x += this.xVec * this.speed;
		this.y += this.yVec * this.speed;
	}
}
