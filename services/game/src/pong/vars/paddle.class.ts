import { User } from "../../join/User.js";
import { GameCanvas } from "./gameCanvas.class.js";
import { Template } from "./template.class.js";

export class Paddle extends Template {
	down: boolean;
	up: boolean;
	score: number;
	user: User;
	private speed: number;

	constructor(
		x: number,
		y: number,
		h: number,
		w: number,
		cu: User,
	) {
		super(x, y, h, w);
		this.up = false;
		this.down = false;
		this.score = 0;
		this.speed = 10;
		this.user = cu;
	}

	update(gameCanvas: GameCanvas) {
		if (this.up == true && this.y <= this.height) {
			this.yVec = -1;
			this.up = false;
		} else if (
			this.down == true &&
			this.y + this.height >= gameCanvas.height - this.height
		) {
			this.yVec = 1;
			this.down = false;
		} else {
			this.yVec = 0;
		}

		this.y += this.speed * this.yVec;
	}
}
