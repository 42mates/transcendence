import i18n from '../i18n/i18n';
import type { JoinResponse, 
			  PlayerInputMessage, GameStateMessage,
			  GameUpdateMessage, TournamentUpdateMessage,
			  QuitRequest, QuitResponse } from '../types/messages';
import Canvas from './Canvas';
import { updatePlayerInfo } from '../utils/gameInfos';
import { loadRoute } from '../router';
import InputHandler, { InputState } from './InputHandler';

export default abstract class Game {

	// Protected properties
	protected _socket:      WebSocket | null = null;
	protected _gameId?:       string = undefined;
	protected _playerId?:     "1" | "2" = undefined;
	protected _status:	      "pending" | "waiting" | "running" | "ended" = "pending";
	protected _canvas:      Canvas | null = null;
	protected joinPromise: Promise<string>;
	protected joinResolve: ((gameId: string) => void) | null = null;

	// Abstract properties and methods (for subclasses)
	protected abstract _inputHandler: InputHandler;
	protected abstract sendJoinRequest(): void;

	// Getters
	public get gameId(): string | undefined { return this._gameId; }
	public get playerId(): "1" | "2" | undefined { return this._playerId; }
	public get alias(): string[] { return this._alias; }
	public get canvas(): Canvas | null { return this._canvas; }
	public get controls(): { up: string, down: string }[] { return this._controls; }


	constructor(
		protected _alias: string[] = ["default1", "default2"],
		protected _controls: { up: string, down: string }[] = [
			{ up: 'ArrowUp', down: 'ArrowDown' },
			{ up: 'w', down: 's' }
		]
	) {
		this.joinPromise = new Promise((resolve) => { this.joinResolve = resolve; });

		const canvasElement = document.getElementById('game-canvas');
		if (!(canvasElement instanceof HTMLCanvasElement))
			throw new Error('Canvas element with id "game-canvas" invalid or not found in the page.');
		this._canvas = new Canvas(canvasElement);
	}

	public connect() {
		const wsUrl = `wss://${window.location.host}/api/game/join`;
		this._socket = new WebSocket(wsUrl);

		this._socket.onopen = () => {
			console.log(`[${this._gameId}] WebSocket connection established`);
			this.joinGame();
		};

		this._socket.onmessage = (event) => this.handleMessage(event);

		this._socket.onerror = (err) => console.error(`[${this._gameId}] WebSocket error:`, err);

		this._socket.onclose = () => {
			console.log(`[${this._gameId}] WebSocket connection closed`);
			loadRoute('/game');
		};

		this._inputHandler.listenForPlayerInput();
	}

	protected async joinGame() {
		// resolve the join promise if it was already created
		this.joinPromise = new Promise((resolve) => { this.joinResolve = resolve; });

		try
		{
			this.sendJoinRequest();
			await this.waitForJoin();
			this.startGame();
		} 
		catch (error: any) 
		{
			console.error('Failed to join game:', error);
			this._canvas?.stopLoadingAnimation();
			this._canvas?.printMessage(error.message);
		}
	}

	protected handleMessage(event: MessageEvent) {
		try {
			const data = JSON.parse(event.data);
			switch (data.type) {
				case 'join_response':
					this.handleJoinResponse(data as JoinResponse);
					break;
				case 'game_state':
					this.handleGameState(data as GameStateMessage);
					break;
				case 'game_update':
					this.handleGameUpdate(data as GameUpdateMessage);
					break;
				case 'tournament_update':
					this.handleTournamentUpdate(data as TournamentUpdateMessage);
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

	protected handleJoinResponse(data: JoinResponse) {
		if (data.status === 'accepted')
		{
			this._playerId = data.playerId!;
			this._gameId = data.gameId!;
			this._canvas?.setServerDimensions(data.dimensions!);

			if (this.joinResolve && data.gameId)
			{
				this.joinResolve(data.gameId);
				this.joinResolve = null;
			}
			console.log(`[${this._gameId}] Joined game as player ${this._playerId}`);
		}
		else if (data.status === 'waiting')
			this.canvas?.drawLoadingAnimation();
		else if (data.status === 'rejected')
		{
			console.error(`Join rejected: ${data.reason ?? 'No reason provided'}, ${JSON.stringify(data)}`);
			alert(i18n.t('game:error.joinRequestFailed') ?? "Failed to join the game. Please try again.");
			this.leaveGame('/game');
			//optionally reject the promise 
		}
		else
		{
			console.warn('Received unexpected join response status:', data.status);
			this.leaveGame('/game');
		}
	}

	public async waitForJoin(): Promise<string> {
		return this.joinPromise;
	}

	public async startGame() {
		this._canvas?.stopLoadingAnimation();

		if (this._canvas)
			await this._canvas.drawCountdown();

		console.log(`[${this._gameId}] Starting game`);
		this._status = "running";

		const startInput = this._controls.map(() => ({ up: false, down: false }));
		this.sendPlayerInput(startInput);
	}

	protected handleGameState(data: GameStateMessage) {
		
		this._status = data.status;
		if (this._status === "ended") return;


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

		//if (this._status !== "ended")
		this._canvas?.updateGameState(data);
	}

	private async handleGameUpdate(data: GameUpdateMessage)
	{
		console.log(`[${this._gameId}] Received game update:`, data);
		this._status = data.status;
		if (data.status === "ended" )
			this._canvas?.printGameEnd(data.winner!, data.score);
	}

	protected handleTournamentUpdate(data: TournamentUpdateMessage) {
		throw new Error("Tournament updates are not supported in this game mode.");
	}

    public sendQuitRequest(reason?: string) {
        if (!this._socket) return;
        const quitRequest: QuitRequest = {
			type: "quit_request",
			alias: this._alias[0], // Assuming player 1 is the one quitting
			gameId: this._gameId,
			playerId: this._playerId,
			reason,
        };
        this._socket.send(JSON.stringify(quitRequest));
    }

	protected handleQuitResponse(data: QuitResponse) {
		if (data.status === "success") {
			if (this._socket) {
				this._socket.close();
				this._socket = null;
			}
			loadRoute('/game');
		} else {
			alert(i18n.t('game:exited.error') ?? "Failed to quit the game.");
		}
	}

	protected sendPlayerInput(input: InputState[]) {
		if (this._status !== "running" || !(this._socket && this._socket.readyState === WebSocket.OPEN)) 
			return;

		let message: PlayerInputMessage = {
			type: "player_input",
			playerId: this._playerId!,
			gameId: this._gameId!,
			input: input
		};
		this._socket.send(JSON.stringify(message));
	}

	protected leaveGame(redirect: string = "/") {
		console.log(`[${this._gameId}] Leaving game, redirecting to ${redirect}`);

		if (this._socket) 
		{
			this._socket.close();
			this._socket = null;
		}
		loadRoute(redirect);
	}
}