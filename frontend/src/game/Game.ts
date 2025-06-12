import i18n from '../i18n/i18n';
import type { JoinRequest, JoinResponse, 
			  PlayerInputMessage, GameStateMessage,
			  GameStatusUpdateMessage, 
			  QuitRequest, QuitResponse } from '../types/GameMessages';
import Canvas from './Canvas';
import { updatePlayerInfo, getPlayerPhoto } from '../utils/gameInfos';
import { waitForEnterKey } from '../utils/keybindings';

export default class Game {

	private _socket:      WebSocket | null = null;

	private _alias:       string[];
	private _gameId:      string | null = null;
	private _playerId:    "1" | "2" = "1";
	private _mode:        "1v1" | "tournament" | "local";
	private _tournamentId?: string;
	private _status:	  "pending" | "waiting" | "running" | "ended" = "pending";
	private _controls:    { up: string, down: string }[];
	
	private _canvas:      Canvas | null = null;
	private _input:       { up: boolean, down: boolean }[];

	private joinPromise: Promise<string>;
	private joinResolve: ((gameId: string) => void) | null = null;

	constructor(
		mode: "1v1" | "tournament" | "local" = '1v1', 
		alias: string[] = ["default1", "default2"],
		controls: { up: string, down: string }[] = [
			{ up: 'ArrowUp', down: 'ArrowDown' },
			{ up: 'w', down: 's' }
		]
	) {
		this._mode = mode;
		this._alias = alias;
		this._controls = controls;

		if (this._mode == "local" && (this._alias.length != 2 || this._controls.length != 2))
			throw new Error('Expected 2 players for local mode in Game object creation.');
		if (this._mode !== "local" && (this._alias.length !== 1 || this._controls.length !== 1))
			throw new Error('Expected 1 player for online mode in Game object creation..');

		this._input = this._mode === "local" 
			? [ { up: false, down: false }, { up: false, down: false } ] 
			: [ { up: false, down: false } ];

		this.joinPromise = new Promise((resolve) => {
			this.joinResolve = resolve;
		});

		const canvasElement = document.getElementById('game-canvas');
		if (!(canvasElement instanceof HTMLCanvasElement))
			throw new Error('Canvas element with id "game-canvas" invalid or not found in the page.');
		this._canvas = new Canvas(canvasElement);

		console.log(`[${this._gameId}] Game initialized in '${this._mode}' for '${this._alias}' (${JSON.stringify(this._controls)})`); 
	}

	public get gameId():			        string | null { return this._gameId; }
	public get playerId():			          "1" | "2" { return this._playerId; }
	public get mode():     "1v1" | "tournament" | "local" { return this._mode; }
	public get alias():						  string[] { return this._alias; }
	public get canvas():			        Canvas | null { return this._canvas; }
	public get controls(): { up: string, down: string }[] { return this._controls; }

	public connect() {
		const wsUrl = `wss://${window.location.host}/api/game/join`;
		this._socket = new WebSocket(wsUrl);

		this._socket.onopen = () => {
			console.log(`[${this._gameId}] WebSocket connection established`);
	
			updatePlayerInfo(1, { alias: this._alias[0] });
			if (this._mode === "local")
				updatePlayerInfo(2, { alias: this._alias[1] });

			this.sendJoinRequest();

			this.waitForJoin().then(() => {
				this.startGame();

			}).catch((error) => {
				console.error('Failed to join game:', error);
				this._canvas?.stopLoadingAnimation();
				this._canvas?.printMessage(error.message);
			});
		};
		this._socket.onmessage = (event) => this.handleMessage(event);
		this._socket.onerror = (err) => console.error(`[${this._gameId}] WebSocket error:`, err);
		this._socket.onclose = () => console.log(`[${this._gameId}] WebSocket connection closed`);

		this.listenForPlayerInput();
	}

	private handleMessage(event: MessageEvent) {
		try {
			const data = JSON.parse(event.data);
			switch (data.type) {
				case 'join_response':
					this.handleJoinResponse(data as JoinResponse);
					break;
				case 'game_state':
					this.handleGameStateMessage(data as GameStateMessage);
					break;
				case 'game_status_update':
					this.handleGameStatusUpdateMessage(data as GameStatusUpdateMessage);
					break;
				case 'quit_response':
					this.handleQuitResponse(data as QuitResponse);
					break;
				case 'game_error':
					console.warn('Game error:', data.message);
					break;
				default:
					console.warn('Received unknown message type:', data);
			}
		} catch (err) {
			console.warn('Failed to handle message (JSON expected):', event.data, err);
		}
	}

	private sendJoinRequest() {
		if (!this._socket || this._socket.readyState !== WebSocket.OPEN) {
			console.error('[sendJoinRequest] WebSocket is not connected');
			return;
		}
		const message: JoinRequest = {
			type: "join_request",
			payload: {
				alias: this._alias,
				mode: this._mode,
				gameId: this._gameId,
				avatar: this._mode === "local" ? [getPlayerPhoto(), "/assets/default_avatar2.png"] : [getPlayerPhoto()],
				tournamentId: this._tournamentId,
			},
		};
		this._socket.send(JSON.stringify(message));
	}

	private handleJoinResponse(data: JoinResponse) {

		if (data.status === 'rejected')
		{
			console.error(`Join rejected: ${data.reason ?? 'No reason provided'}`);
			alert(i18n.t('game:error.joinRequestFailed') ?? "Failed to join the game. Please try again.");
			this._socket?.close();
			//optionally reject the promise 
		} 
		else
		{
			if (data.status === 'accepted')
			{
				if (!data.aliases || data.aliases.length < 2)
				{
					console.error(`[${this._gameId}] Join response missing aliases for both players.`);
					return;
				}

				this._playerId = data.playerId!; // Ensure playerId is defined
				const p1 = this._playerId === "1" ? 0 : 1;
				const p2 = this._playerId === "1" ? 1 : 0;
				updatePlayerInfo(1, { alias: data.aliases[p1], photoUrl: data.avatar![p1] });
				updatePlayerInfo(2, { alias: data.aliases[p2], photoUrl: data.avatar![p2] });

				this._tournamentId = data.tournament?.id;
				this._gameId = data.gameId ?? null;
				if (data.dimensions) 
					this._canvas?.setServerDimensions(data.dimensions);
				if (this.joinResolve && data.gameId)
				{
					this.joinResolve(data.gameId);
					this.joinResolve = null;
				}
				console.log(`[${this._gameId}] Joined game as '${this.playerId === "1" ? data.aliases[0] : data.aliases[1]}' (playerId: ${this._playerId ? data.playerId : '[local]'})`);
			}
			else if (data.status === 'waiting')
			{
				this.canvas?.drawLoadingAnimation();	
				console.log(`[${this._gameId}] First player waiting.`);
			}

		}
	}

	public async waitForJoin(): Promise<string> {
		return this.joinPromise;
	}

	public async startGame() {
		this._canvas?.stopLoadingAnimation();

		//if (this._canvas) {
		//	await this._canvas.drawCountdown();
		//}

		this._status = "running";
		this.sendPlayerInput(); // Send first input to initialize the game
	}

	private handleGameStateMessage(data: GameStateMessage) {
		this._status = data.status;

		// Mirror the game state for player 2 in online mode
		if (this._playerId === "2" && this._canvas?.serverDimensions) {
			const p_swap = data.paddles[0].x; 
			data.paddles[0].x = data.paddles[1].x;
			data.paddles[1].x = p_swap;
			data.ball.x = this._canvas.serverDimensions.width - data.ball.x - this._canvas.serverDimensions.paddleWidth;

			const s_swap = data.score[0];
			data.score[0] = data.score[1];
			data.score[1] = s_swap;
		}

		updatePlayerInfo(1, { score: data.score[0] });
		updatePlayerInfo(2, { score: data.score[1] });

		//console.log(`[${this._gameId}] ball: (${data.ball.x}, ${data.ball.y}), paddles: [(${data.paddles[0].x}, ${data.paddles[0].y}), (${data.paddles[1].x}, ${data.paddles[1].y})], score: ${data.score}, status: ${data.status}`);

		if (this._status !== "ended")
			this._canvas?.updateGameState(data);
	}

	private async handleGameStatusUpdateMessage(data: GameStatusUpdateMessage){
		this._status = data.status;

		if (data.status === "ended")
		{
			this._canvas?.printGameEnd(data.winner!, data.score);
		} else {
			console.log(`[${this._gameId}] Game status updated to '${data.status}'`);
		}
		if (data.tournamentId && data.tournamentStatus) {
			if (data.tournamentStatus !== "ended") {
				await waitForEnterKey();
				console.log(`[${this._gameId}] Tournament game 1 ended. Sending join request for next game...`);
				this.sendJoinRequest();
				await this.waitForJoin();
				console.log(`[${this._gameId}] Tournament game 1 joined.`);
				this.startGame();
				//console.log(`[${this._gameId}] Tournament game 2 started.`);
			}
			//else
				// print results

		}
	}

    public sendQuitRequest(reason?: string) {
        if (!this._socket || !this._gameId || !this._playerId) return;
        const quitRequest: QuitRequest = {
			type: "quit_request",
			gameId: this._gameId,
			playerId: this._playerId,
			reason,
        };
        this._socket.send(JSON.stringify(quitRequest));
    }

    private handleQuitResponse(data: QuitResponse) {
        if (data.status === "success")
		{
			if (confirm(i18n.t('game:exited.success') ?? "Game ended. Return to home?"))
				window.location.href = '/';
        }
		else
			alert(i18n.t('game:exited.error') ?? "Failed to quit the game.");
    }


	
	private inputLoopActive = false;
	private inputLoopRequestId: number | null = null;
	private lastInputState: string = '';

	private listenForPlayerInput() {
		const canvasElement = document.getElementById('game-canvas');
		if (!(canvasElement instanceof HTMLCanvasElement)) return;

		canvasElement.tabIndex = 0;
		canvasElement.style.outline = 'none';
		canvasElement.focus();

		const handleKey = (event: KeyboardEvent, keydown: boolean) => {
			let changed = false;
			this._controls.forEach((control, idx) => {
				if (event.key === control.up && this._input[idx].up !== keydown) {
					this._input[idx].up = keydown;
					changed = true;
					event.preventDefault();
				}
				if (event.key === control.down && this._input[idx].down !== keydown) {
					this._input[idx].down = keydown;
					changed = true;
					event.preventDefault();
				}
			});
			if (changed) {
				if (this.inputLoopActive) return;
				this.inputLoopActive = true;
				this.inputLoop();
			}
		};

		canvasElement.addEventListener('keydown', (e) => handleKey(e, true));
		canvasElement.addEventListener('keyup', (e) => handleKey(e, false));
	}


	private inputLoop = () => {

		//console.log(`[${this._gameId}] Input loop running for player ${this._playerId}: ${JSON.stringify(this._input)}`);
		const anyKeyPressed = this._input.some(input => input.up || input.down);
		const inputState = JSON.stringify(this._input);

		if (anyKeyPressed) {
			this.sendPlayerInput();
			this.lastInputState = inputState;
			this.inputLoopRequestId = window.requestAnimationFrame(this.inputLoop);
		} else {
			if (inputState !== this.lastInputState) {
				this.sendPlayerInput();
				this.lastInputState = inputState;
			}
			this.inputLoopActive = false;
			this.inputLoopRequestId = null;
		}

	};


	private sendPlayerInput() {
		if (this._status !== "running" || !(this._socket && this._socket.readyState === WebSocket.OPEN)) 
			return;

		//console.log(`[${this._gameId}] Sending player input for player ${this._playerId}: ${JSON.stringify(this._input)}`);

		let message: PlayerInputMessage = {
			type: "player_input",
			playerId: this._playerId,
			gameId: this._gameId || null,
			input: this._input
		};
		//console.log(`[${this._gameId}] Sending player input: ${JSON.stringify(message)}`);
		this._socket.send(JSON.stringify(message));
	}
}