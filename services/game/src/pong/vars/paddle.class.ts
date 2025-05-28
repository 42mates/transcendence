import { GameElement } from "./gameElement.class.js";

export class Paddle extends GameElement {
	down: boolean;
	up: boolean;
	score: number;

	constructor(x: number, y: number, h: number, w: number, s: number) {
		super(x, y, h, w, s);
		this.up = false;
		this.down = false;
		this.score = 0;
	}

	update(canvas) {
		if (this.up == true && this.y <= 20) {
			this.yVec = -1;
		} else if (
			this.down == true &&
			this.y + this.height >= canvas.height - 20
		) {
			this.yVec = 1;
		} else {
			this.yVec = 0;
		}

		this.y += this.speed * this.yVec;
	}
}
