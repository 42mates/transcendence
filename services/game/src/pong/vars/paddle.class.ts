import { ConnectedUser, GameStateMessage } from "../../types/GameMessages.js";
import { GameCanvas } from "./gameCanvas.class.js";
import { Template } from "./template.class.js";
import { Ball } from "./ball.class.js";

export class Paddle extends Template {
	down: boolean;
	up: boolean;
	score: number;
	connectedUsers: ConnectedUser;
	private speed: number;

	constructor(x: number, y: number, h: number, w: number, cu: ConnectedUser) {
		super(x, y, h, w);
		this.up = false;
		this.down = false;
		this.score = 0;
		this.speed = 10;
		this.connectedUsers = cu;
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

	sendUpdate(player2: Paddle, ball: Ball) {
		const response: GameStateMessage = {
			type: "game_state",
			ball: { x: ball.x, y: ball.y },
			paddles: [
				{ x: player2.x, y: player2.y },
				{ x: player2.x, y: player2.y },
			],
			score: this.score,
			status: 
		};
		this.connectedUsers.ws.send(JSON.stringify(response));
	}
}
