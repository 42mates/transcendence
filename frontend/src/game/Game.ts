import i18n from '../i18n/i18n';
import type { JoinRequest, JoinResponse, PlayerInputMessage, GameStateMessage, GameStatusUpdateMessage, GameError } from '../types/GameMessages';
import Canvas from './Canvas';

export default class Game {

	private _socket:     WebSocket | null = null;
	private _alias:      string;
	private _gameId:     string | null = null;
	private _playerId:   "1" | "2" | null = null;
	private _mode:       "1v1" | "tournament" | "local";
	private _controls:   { up: string, down: string };
	private _gameStarted: boolean = false;
	private _canvas:      Canvas | null = null;

	private joinPromise: Promise<string>;
	private joinResolve: ((gameId: string) => void) | null = null;

	constructor(
		mode: "1v1" | "tournament" | "local" = '1v1', 
		alias: string = "default",
		gameId: string | null = null,
		controls: { up: string, down: string } = { up: 'ArrowUp', down: 'ArrowDown' }
	) {
		this._mode = mode;
		this._alias = alias;
		this._gameId = gameId || null;
		this._controls = controls;
		this.joinPromise = new Promise((resolve) => {
			this.joinResolve = resolve;
		});
		const canvasElement = document.getElementById('game-canvas');
		if (!(canvasElement instanceof HTMLCanvasElement)) {
			throw new Error('Canvas element with id "game-canvas" invalid or not found in the page.');
		}
		this._canvas = new Canvas(canvasElement);
		console.log(`[${this._gameId}] Game initialized in '${this._mode}' for '${this._alias}' (${JSON.stringify(this._controls)})`); 
	}

	public get gameId():                  string | null { return this._gameId; }
	public get playerId():             "1" | "2" | null { return this._playerId; }
	public get mode():   "1v1" | "tournament" | "local" { return this._mode; }
	public get alias():                          string { return this._alias; }
	public get canvas():                  Canvas | null { return this._canvas; }
	public get controls(): { up: string, down: string } { return this._controls; }

	public connect() {
		const wsUrl = `wss://${window.location.host}/api/game/join`;
		this._socket = new WebSocket(wsUrl);

		this._socket.onopen = () => {
			console.log(`[${this._gameId}] WebSocket connection established`);
			this.sendJoinRequest();
			//this._canvas?.printError("TESTMESSAGE");
			this._canvas?.drawLoadingAnimation();
			this.waitForJoin().then(() => {
				this.startGame();

			}).catch((error) => {
				console.error('Failed to join game:', error);
				this._canvas?.stopLoadingAnimation();
				this._canvas?.printError(error.message);
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
			if (data.type === 'join_response')
				this.handleJoinResponse(data as JoinResponse);
			else if (data.type === 'game_state')
				this.handleGameStateMessage(data as GameStateMessage);
			else if (data.type === 'game_error')
				console.warn('Game error:', data.message);
			else
				console.warn('Received unknown message type:', data);

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
			},
		};
		this._socket.send(JSON.stringify(message));
	}

	private handleJoinResponse(data: JoinResponse) {
		this._playerId = data.playerId;
		this._gameStarted = data.status === 'accepted';

		if (data.status === 'rejected') {
			console.error(`Join rejected: ${data.reason ?? 'No reason provided'}`);
			alert(i18n.t('game:error.joinRequestFailed') ?? "Failed to join the game. Please try again.");
			this._socket?.close();
			//optionally reject the promise 
		} else {
			if (data.status === 'accepted') {
				this._gameStarted = true;
				console.log(`[${this._gameId}] Joined game as '${data.alias}' (playerId: ${this._playerId})`);
			}
			else
				console.log(`[${this._gameId}] First player waiting.`);
			
			this._gameId = data.gameId ?? null;
			if (data.dimensions) 
				this._canvas?.setServerDimensions(data.dimensions);
			if (this.joinResolve && data.gameId) {
				this.joinResolve(data.gameId);
				this.joinResolve = null;
			}
		}
	}

	public async waitForJoin(): Promise<string> {
		return this.joinPromise;
	}

	public startGame() {
		this._canvas?.stopLoadingAnimation();

		// Send first input to initialize the game
		this.sendPlayerInput({ up: false, down: false });
	}

	private handleGameStateMessage(data: GameStateMessage) {
		// In local mode, only player 1's game updates are processed, since they share the canvas.
		if (this._mode === 'local' && this._playerId === "2")
			return;

		if (this._playerId === "2" && this._canvas?.serverDimensions) {
			data.paddles[0].x = this._canvas.serverDimensions.width - data.paddles[0].x;
			data.paddles[1].x = this._canvas.serverDimensions.width - data.paddles[1].x;
			data.ball.x = this._canvas.serverDimensions.width - data.ball.x;
		}

		console.log(`[${this._gameId}] ball: (${data.ball.x}, ${data.ball.y}), paddles: [(${data.paddles[0].x}, ${data.paddles[0].y}), (${data.paddles[1].x}, ${data.paddles[1].y})], score: ${data.score}, status: ${data.status}`);

		this._canvas?.updateGameState(data);
	}

	private listenForPlayerInput() {
		const canvasElement = document.getElementById('game-canvas');
		if (!canvasElement) return;

		canvasElement.tabIndex = 0; // Make canvas focusable
		// Focus canvas by default without showing the default focus outline
		canvasElement.style.outline = 'none';
		canvasElement.focus();

		canvasElement.addEventListener('keydown', (event) => {
			if (!this._gameStarted || !this._alias || !this._playerId || !this._controls) return;

			if (event.key === this._controls.up || event.key === this._controls.down) {
				event.preventDefault(); // Prevent scrolling or other default actions
				const input: PlayerInputMessage['input'] = {
					up: event.key === this._controls.up,
					down: event.key === this._controls.down
				};
				this.sendPlayerInput(input);
			}
		});
	}

	private sendPlayerInput(input: PlayerInputMessage['input']) {
		if (this._socket && this._socket.readyState === WebSocket.OPEN && this._playerId){
			let message: PlayerInputMessage = {
				type: "player_input",
				playerId: this._playerId,
				gameId: this._gameId || null,
				input: input
			};
			this._socket.send(JSON.stringify(message));
		}
	}
}