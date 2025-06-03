import { GameStateMessage } from "../../types/messages.js";
import { User }             from "../../join/User.js";
import { GameCanvas }       from "./gameCanvas.class.js";
import { Template }         from "./template.class.js";
import { Ball }             from "./ball.class.js";
import { GameInstance }     from "./game.class.js";

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

	sendUpdate(
		player1: Paddle,
		player2: Paddle,
		ball: Ball,
		gameInstance: GameInstance,
	) {
		const response: GameStateMessage = {
			type: "game_state",
			ball: { x: ball.x, y: ball.y },
			paddles: [
				{ x: player1.x, y: player1.y },
				{ x: player2.x, y: player2.y },
			],
			score: [player1.score, player2.score],
			status: gameInstance.status,
		};
		this.user.send(response);
	}
}
