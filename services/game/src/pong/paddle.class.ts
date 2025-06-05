import { User } from "../join/User";
import { GameCanvas } from "./gameCanvas.class";
import { Template } from "./template.class";

export class Paddle extends Template {
	down: boolean;
	up: boolean;
	score: number;
	user: User;
	private speed: number;

	constructor(x: number, y: number, h: number, w: number, cu: User) {
		super(x, y, h, w);
		this.up = false;
		this.down = false;
		this.score = 0;
		this.speed = 10;
		this.user = cu;
	}

	update(gameCanvas: GameCanvas) {
		if (this.up == true && this.y - this.speed <= this.height) {
			this.yVec = -1;
		} else if (
			this.down == true &&
			this.y + this.speed + this.height >= gameCanvas.height
		) {
			this.yVec = 1;
		} else {
			this.yVec = 0;
		}

		this.up = false;
		this.down = false;

		this.y += this.speed * this.yVec;
	}
}
