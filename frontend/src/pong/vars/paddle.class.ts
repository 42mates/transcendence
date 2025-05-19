import {GameElement} from './gameElement.class.js';

export class Paddle extends GameElement {
	constructor(x: number, y: number, h: number, w: number, s: number) {
		super(x, y, h, w, s);
	}

	update() {}
}
