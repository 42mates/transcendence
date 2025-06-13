import { User } from "../join/User";
import { GameCanvas } from "./gameCanvas.class";
import { Template } from "./template.class";

export class Paddle extends Template {
	down: boolean;
	up: boolean;
	score: number;
	user: User;
	private speed: number;

	constructor(x: number, y: number, w: number, h: number, cu: User) {
		super(x, y, w, h);
		this.up = false;
		this.down = false;
		this.score = 0;
		this.speed = 1;
		this.user = cu;
	}

	update(gameCanvas: GameCanvas) {
		if (this.up && this.y - this.speed >= 0) {
			this.yVec = -1;
		} else if (
			this.down &&
			this.y + this.height + this.speed <= gameCanvas.height
		) {
			this.yVec = 1;
		} else {
			this.yVec = 0;
		}

		this.up = false;
		this.down = false;

		this.y += this.speed * this.yVec;
		this.yVec = 0;
	}
}
