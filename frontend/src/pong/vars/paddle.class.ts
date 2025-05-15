import {GameElement} from './gameElement.class.js';

export class Paddle extends GameElement {
	constructor(x: number, y: number, h: number, w: number, s: number) {
		super(x, y, h, w, s);
	}

	update(xVec: number, yVec: number) {
		this.xVec = xVec;
		this.yVec = yVec;
	}
}
