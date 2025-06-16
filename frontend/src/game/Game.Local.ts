import Game from "./Game";
import InputHandler from "./InputHandler";

import { JoinRequest, JoinResponse } from "../types/messages";

import { updatePlayerInfo } from "../utils/gameInfos";
import { getPlayerPhoto } from "../utils/gameInfos";

export default class LocalGame extends Game {
	override _inputHandler: InputHandler;

	constructor(
		override _alias: string[] = ["default1", "default2"],
		override _controls: { up: string, down: string }[] = [
			{ up: 'ArrowUp', down: 'ArrowDown' },
			{ up: 'w', down: 's' }
		]
	) {
		super(_alias, _controls);

		if (this._alias.length !== 2 || this._controls.length !== 2)
			throw new Error('Expected 2 players for local mode in Game object creation.');

		this._inputHandler = new InputHandler(this._controls, this.sendPlayerInput.bind(this));

		console.log(`[${this._gameId}] Local Game initialized in for players '${this._alias[0]}' and '${this._alias[1]}'`); 
	}

	override async joinGame() {
		updatePlayerInfo(1, { alias: this._alias[0] });
		updatePlayerInfo(2, { alias: this._alias[1] });
		super.joinGame();
	}

	override sendJoinRequest() {
		const message: JoinRequest = {
			type: "join_request",
			payload: {
				alias: this._alias,
				mode: "local",
				gameId: this._gameId || null,
				avatar: [getPlayerPhoto(), "/assets/default_avatar2.png"],
				tournamentId: undefined
			},
		};
		this._socket!.send(JSON.stringify(message));
	}

	override handleJoinResponse(data: JoinResponse) {
		if (data.status === 'accepted')
		{
			if (data.aliases && data.aliases.length >= 2 && data.avatar && data.avatar.length >= 2) {
				updatePlayerInfo(1, { alias: data.aliases[0], photoUrl: data.avatar[0] });
				updatePlayerInfo(2, { alias: data.aliases[1], photoUrl: data.avatar[1] });
			}
		}
		super.handleJoinResponse(data);
	}
}