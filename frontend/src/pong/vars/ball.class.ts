import { GameElement } from "./gameElement.class.js";
import { Paddle } from "./paddle.class.js";

export class Ball extends GameElement {
	constructor(x: number, y: number, h: number, w: number, s: number) {
		super(x, y, h, w, s);
	}

	update(player1: Paddle, player2: Paddle, canvas) {
		this.x += this.xVec * this.speed;
		this.y += this.yVec * this.speed;
	}
}
