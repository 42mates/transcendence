import Game from "./Game";
import InputHandler from "./InputHandler";

import i18n from "../i18n/i18n";

import { JoinRequest, JoinResponse, GameStatusUpdateMessage } from "../types/messages";

import { updatePlayerInfo } from "../utils/gameInfos";
import { getPlayerPhoto } from "../utils/gameInfos";


export default class TournamentGame extends Game {
	override _inputHandler: InputHandler;

	private _gameNum: number = 0;
	private _tournamentId?: string = undefined;

	constructor(
		override _alias: string[] = ["default1"],
		override _controls: { up: string, down: string }[] = 
			[{ up: 'ArrowUp', down: 'ArrowDown' }]
	) {
		super(_alias, _controls);

		if (this._alias.length !== 1 || this._controls.length !== 1)
			throw new Error('Expected 1 players for tournament mode in Game object creation.');

		this._inputHandler = new InputHandler(this._controls, this.sendPlayerInput.bind(this));

		console.log(`[${this._gameId}] Local Game initialized in for players '${this._alias[0]}'`); 
	}

	override async joinGame() {
		updatePlayerInfo(1, { alias: this._alias[0] });
		super.joinGame();
	}

	override sendJoinRequest() {
		if (!this._socket || this._socket.readyState !== WebSocket.OPEN) {
			console.error('[sendJoinRequest] WebSocket is not connected');
			return;
		}
		const message: JoinRequest = {
			type: "join_request",
			payload: {
				alias: this._alias,
				mode: "tournament",
				gameId: this._gameId || null,
				avatar: [getPlayerPhoto()],
				tournamentId: this._tournamentId,
			},
		};
		this._socket.send(JSON.stringify(message));
	}

	override handleJoinResponse(data: JoinResponse) {
		if (data.status === 'accepted')
		{
			const p1 = data.playerId === "1" ? 0 : 1;
			const p2 = data.playerId === "1" ? 1 : 0;
			updatePlayerInfo(1, { alias: data.aliases![p1], photoUrl: data.avatar![p1] });
			updatePlayerInfo(2, { alias: data.aliases![p2], photoUrl: data.avatar![p2] });
			this._gameNum++;
			if (this._gameNum > 2)
				console.warn(`[${this._gameId}] More than 2 games in tournament mode detected. This is unexpected.`);
		}
		super.handleJoinResponse(data);
	}


	override async handleGameStatusUpdate(data: GameStatusUpdateMessage) {
		super.handleGameStatusUpdate(data);


		if (!data.tournamentId || !data.tournamentStatus)
			throw new Error("Game status update received without tournamentId or tournamentStatus.");
		
		if (data.tournamentStatus === "ended")
		{
			console.log(`[${this._gameId}] Tournament ended.`);
			this.canvas?.printLeaderboard(data.leaderboard!);

			this.leaveGame('/');
			return;
		}

		this._tournamentId = data.tournamentId;

		await this._inputHandler.keyPressed("Enter");

		if (this._gameNum < 2)
		{
			if (data.tournamentStatus === "waiting")
				this.canvas?.drawLoadingAnimation();
			this._gameId = undefined;
			this._playerId = undefined;
			this.joinGame();
		}
		else
			console.log(`[${this._gameId}] request ${this._gameNum}`);
	}
}