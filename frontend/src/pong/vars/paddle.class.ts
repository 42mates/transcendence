import { GameElement } from "./gameElement.class.js";

export class Paddle extends GameElement {
	keyDown: boolean;
	keyUp: boolean;

	constructor(
		x: number,
		y: number,
		h: number,
		w: number,
		s: number,
		u: number,
		d: number,
	) {
		super(x, y, h, w, s);
		this.keyUp = false;
		this.keyDown = false;
	}

	update(canvas) {
		if (this.keyUp == true && this.y <= 20) {
			this.yVec = -1;
		} else if (
			this.keyDown == true &&
			this.y + this.height >= canvas.height - 20
		) {
			this.yVec = 1;
		} else {
			this.yVec = 0;
		}

		this.y += this.speed * this.yVec;
	}
}
