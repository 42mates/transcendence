import type { JoinRequest, JoinResponse, PlayerInputMessage, GameStateMessage } from '../types/GameMessages';
import Canvas from './Canvas';

export default class Game {

	private socket: WebSocket | null = null;
	private alias: string;
	private gameId: string | null = null;
	private playerId: "1" | "2" | null = null;
	private mode: "1v1" | "tournament" | "local";
	private controls: { up: string, down: string } | null = null;
	private gameStarted = false;
	private canvas: Canvas | null = null;

	private joinPromise: Promise<string>;
	private joinResolve: ((gameId: string) => void) | null = null;

	constructor(
		mode: "1v1" | "tournament" | "local" = '1v1', 
		alias: string = "default",
		gameId: string | null = null,
		controls: { up: string, down: string } = { up: 'ArrowUp', down: 'ArrowDown' }
	) {
		this.mode = mode;
		this.alias = alias;
		this.gameId = gameId || null;
		this.controls = controls;
		this.joinPromise = new Promise((resolve) => {
			this.joinResolve = resolve;
		});
		const canvasElement = document.getElementById('game-canvas');
		if (!(canvasElement instanceof HTMLCanvasElement)) {
			throw new Error('Canvas element with id "game-canvas" invalid or not found in the page.');
		}
		this.canvas = new Canvas(canvasElement);
		console.log(`Game initialized with mode '${this.mode}' for alias '${this.alias}', gameId '${this.gameId}', and controls: ${JSON.stringify(this.controls)}`); 
	}

	public connect() {
		const wsUrl = `wss://${window.location.host}/api/game/join`;
		this.socket = new WebSocket(wsUrl);

		this.socket.onopen = () => {
			console.log('WebSocket connection established');
			this.sendJoinRequest();
			//this.canvas?.printError("TESTMESSAGE");
			this.canvas?.drawLoadingAnimation();
			this.waitForJoin().then((gameId) => {
				this.canvas?.stopLoadingAnimation();

				//this.canvas?.printError("GAME HERE");

				let firstGameState: GameStateMessage = {
					type: "game_state",
					ball: { x: 100 / 2, y: 50 },
					paddles: [
						{ x: 0,   y: 50 },
						{ x: 100, y: 50 }
					],
					score: [0, 0],
					status: "started"
				};
				this.canvas?.updateGameState(firstGameState);

			}).catch((error) => {
				console.error('Failed to join game:', error);
				this.canvas?.stopLoadingAnimation();
				this.canvas?.printError(error.message);
			});
		};
		this.socket.onmessage = (event) => this.handleMessage(event);
		this.socket.onerror = (err) => console.error('WebSocket error:', err);
		this.socket.onclose = () => console.log('WebSocket connection closed');

		this.listenForPlayerInput();
	}

	public async waitForJoin(): Promise<string> {
		return this.joinPromise;
	}

	private sendJoinRequest() {
		if (!this.socket || this.socket.readyState !== WebSocket.OPEN) {
			console.error('[sendJoinRequest] WebSocket is not connected');
			return;
		}
		const message: JoinRequest = {
			type: "join_request",
			payload: {
				alias: this.alias,
				mode: this.mode,
				gameId: this.gameId,
			},
		};
		this.socket.send(JSON.stringify(message));
	}

	private handleMessage(event: MessageEvent) {
		try {
			const data = JSON.parse(event.data);
			if (data.type === 'join_response') {
				this.handleJoinResponse(data as JoinResponse);
			} else if (data.type === 'game_state') {
				this.handleGameStateMessage(data as GameStateMessage);
			} else {
				console.warn('Received unknown message type:', data);
			}
		} catch (err) {
			console.warn('Failed to handle message (JSON expected):', event.data, err);
		}

	}

	private handleJoinResponse(data: JoinResponse) {
		this.playerId = data.playerId;
		this.gameStarted = data.status === 'accepted';

		if (data.status === 'rejected') {
			console.error(`Join rejected: ${data.reason ?? 'No reason provided'}`);
			this.socket?.close();
			//// Optionally reject the promise below
			//if (this.joinResolve) {
			//	this.joinResolve = null;
			//	this.joinPromise = Promise.reject(new Error(`Join rejected: ${data.reason ?? 'No reason provided'}`));
			//}
		} else {
			this.gameStarted = true;
			this.gameId = data.gameId ?? null;
			console.log(`Joined game ${data.gameId} as player ${data.alias} (ID: ${this.playerId})`);
			if (this.joinResolve && data.gameId) {
				this.joinResolve(data.gameId);
				this.joinResolve = null;
			}
		}
	}

	private parseGameState(data: GameStateMessage): GameStateMessage {
		if (this.playerId === "2") 
		{
			data.paddles[0].x = 100 - data.paddles[0].x;
			data.paddles[1].x = 100 - data.paddles[1].x;
			data.ball.x = 100 - data.ball.x;
		}
		return data;
	}

	private handleGameStateMessage(data: GameStateMessage) {
		this.canvas?.updateGameState(this.parseGameState(data));
	}
	private listenForPlayerInput() {
		const canvasElement = document.getElementById('game-canvas');
		if (!canvasElement) return;

		canvasElement.tabIndex = 0; // Make canvas focusable
		// Focus canvas by default without showing the default focus outline
		canvasElement.style.outline = 'none';
		canvasElement.focus();

		canvasElement.addEventListener('keydown', (event) => {
			if (!this.gameStarted || !this.alias || !this.playerId || !this.controls) return;

			if (event.key === this.controls.up || event.key === this.controls.down) {
				event.preventDefault(); // Prevent scrolling or other default actions
				const input: PlayerInputMessage['input'] = {
					up: event.key === this.controls.up,
					down: event.key === this.controls.down
				};
				this.sendPlayerInput(input);
			}
		});
	}

	private sendPlayerInput(input: PlayerInputMessage['input']) {
		if (this.socket && this.socket.readyState === WebSocket.OPEN && this.playerId){
			let message: PlayerInputMessage = {
				type: "player_input",
				playerId: this.playerId,
				gameId: this.gameId || null,
				input: input
			};
			this.socket.send(JSON.stringify(message));
		}
	}
}