import { ConnectedUser } from "../../types/GameMessages.js";
import { GameCanvas } from "./gameCanvas.class.js";
import { Template } from "./template.class.js";

export class Paddle extends Template {
	down: boolean;
	up: boolean;
	score: number;
	connectedUsers: ConnectedUser;
	private speed: number;

	constructor(x: number, y: number, h: number, w: number, c: ConnectedUser) {
		super(x, y, h, w);
		this.up = false;
		this.down = false;
		this.score = 0;
		this.speed = 10;
		this.connectedUsers = c;
	}

	update(gameCanvas: GameCanvas) {
		if (this.up == true && this.y <= 20) {
			this.yVec = -1;
		} else if (
			this.down == true &&
			this.y + this.height >= gameCanvas.height - 20
		) {
			this.yVec = 1;
		} else {
			this.yVec = 0;
		}

		this.y += this.speed * this.yVec;
	}
}
