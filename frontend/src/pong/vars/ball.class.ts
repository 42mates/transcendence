import { GameElement } from "./gameElement.class.js";
import { Paddle } from "./paddle.class.js";

export class Ball extends GameElement {
	constructor(x: number, y: number, h: number, w: number, s: number) {
		super(x, y, h, w, s);
		this.xVec = 1;
		this.yVec = 1;
	}

	update(player1: Paddle, player2: Paddle, canvas) {
		if (this.xVec > 0) {
			if (this.x + 1 >= player1.x - player1.width) {
				this.xVec *= -1;
			}
			if (this.yVec > 1) {
				if (this.y + 1 >= canvas.height) {
					this.yVec *= -1;
				}
			} else {
				if (this.y - 1 <= canvas.height) {
					this.yVec *= -1;
				}
			}
		} else {
			if (this.x + 1 <= player2.x) {
				this.xVec *= -1;
			}
			if (this.yVec < 1) {
				if (this.y + 1 <= canvas.height) {
					this.yVec *= -1;
				}
			} else {
				if (this.y - 1 >= canvas.height) {
					this.yVec *= -1;
				}
			}
		}

		this.x += this.xVec * this.speed;
		this.y += this.yVec * this.speed;
	}
}
