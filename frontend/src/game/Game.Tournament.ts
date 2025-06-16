import Game from "./Game";
import InputHandler from "./InputHandler";

import { JoinRequest, JoinResponse, TournamentUpdateMessage } from "../types/messages";

import { updatePlayerInfo } from "../utils/gameInfos";
import { getPlayerPhoto } from "../utils/gameInfos";


export default class TournamentGame extends Game {
	override _mode: "tournament" = "tournament";
	override _inputHandler: InputHandler;

	private _tournamentId?: string = undefined;
	private _finaleReady: boolean = false;
	private _finaleRequested: boolean = false;
	private _t_status: "waiting" | "finale_ready" | "running" | "ended" = "waiting";

	constructor(
		override _alias: string[] = ["default1"],
		override _controls: { up: string, down: string }[] = 
			[{ up: 'ArrowUp', down: 'ArrowDown' }]
	) {
		super(_alias, _controls);

		if (this._alias.length !== 1 || this._controls.length !== 1)
			throw new Error('Expected 1 players for tournament mode in Game object creation.');

		this._inputHandler = new InputHandler(this._controls, this.sendPlayerInput.bind(this));
	}

	override async joinGame() {
		updatePlayerInfo(1, { alias: this._alias[0] });
		super.joinGame();
	}

	override sendJoinRequest() {
		if (!this._socket 
			|| this._socket.readyState !== WebSocket.OPEN 
			|| this._t_status === "ended")
			return;

		const message: JoinRequest = {
			type: "join_request",
			payload: {
				alias: this._alias,
				mode: this._mode,
				gameId: this._gameId || null,
				avatar: [getPlayerPhoto()],
				tournamentId: this._tournamentId,
			},
		};
		console.log(`[${this._gameId}] Sending join request for game ID: ${this._gameId}`);
		this._socket.send(JSON.stringify(message));
	}

	override handleJoinResponse(data: JoinResponse) {
		if (data.status === 'accepted')
		{
			const p1 = data.playerId === "1" ? 0 : 1;
			const p2 = data.playerId === "1" ? 1 : 0;
			updatePlayerInfo(1, { alias: data.aliases![p1], photoUrl: data.avatar![p1] });
			updatePlayerInfo(2, { alias: data.aliases![p2], photoUrl: data.avatar![p2] });
		}
		super.handleJoinResponse(data);
		if (data.status === 'accepted')
			console.log(`[${this._gameId}] Join request accepted for game ID: ${this._gameId}`);
	}


	override async handleTournamentUpdate(data: TournamentUpdateMessage){
		console.log(`[${this._gameId}] Received tournament update:`, data);
		if (!data.tournamentId || !data.status)
			throw new Error("Game status update received without tournamentId or tournamentStatus.");

		this._tournamentId = data.tournamentId;

		if (data.status === "ended")
		{
			console.log(`[${this._gameId}] Tournament ended.`);
			this._t_status = "ended";
			this.canvas?.printLeaderboard(data.leaderboard!);

			//this.leaveGame('/');
			return;
		}

		if (data.status === "finale_ready") this._finaleReady = true;

		if (this._finaleReady && !this._finaleRequested)
		{
			this._finaleReady = true;
			this.canvas?.printMessage("Finale is ready! Press Enter to join.");

			this._finaleRequested = true; // Empêche plusieurs triggers

			this._tournamentId = data.tournamentId;

			this._inputHandler.keyPressed("Enter").then(() => {
				if (this._gamesPlayed > 1) return;
				this._gameId = undefined;
				this._playerId = undefined;
				this.joinGame();
			});
		}
	}
}