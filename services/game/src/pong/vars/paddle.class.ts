import { GameCanvas } from "./gameCanvas.class.js";
import { Template } from "./template.class.js";
import { ConnectedUser } from "../../types/GameMessages.js";

export class Paddle extends Template {
	ID: number;
	down: boolean;
	up: boolean;
	score: number;
	connectedUser: ConnectedUser;
	private speed: number;

	constructor(
		id: number,
		x: number,
		y: number,
		h: number,
		w: number,
		cu: ConnectedUser,
	) {
		super(x, y, h, w);
		this.ID = id;
		this.up = false;
		this.down = false;
		this.score = 0;
		this.speed = 10;
		this.connectedUser = cu;
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
