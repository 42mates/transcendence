import { GameElement } from "./gameElement.class.js";

export class Paddle extends GameElement {
	keyDown: number;
	keyUp: number;

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
		this.keyUp = u;
		this.keyDown = d;
	}

	update(canvas) {}
}
