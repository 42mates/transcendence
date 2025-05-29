import type { JoinRequest, JoinResponse, PlayerInputMessage, GameStateMessage } from '../types/GameMessages';

export default class Game {

	private socket: WebSocket | null = null;
	private alias: string;
	private gameId: string | null = null;
	private playerId: string | null = null;
	private mode: "1v1" | "tournament" | "local";
	private gameStarted = false;

	private joinPromise: Promise<string>;
	private joinResolve: ((gameId: string) => void) | null = null;

	constructor(mode: "1v1" | "tournament" | "local" = '1v1', alias: string = "default", gameId: string | null = null) {
		this.mode = mode;
		this.alias = alias;
		this.gameId = gameId || null;
		this.joinPromise = new Promise((resolve) => {
			this.joinResolve = resolve;
		});
	}

    public async waitForJoin(): Promise<string> {
        return this.joinPromise;
    }

	public connect() {
		const wsUrl = `wss://${window.location.host}/api/game/join`;
		this.socket = new WebSocket(wsUrl);

		this.socket.onopen = () => {
			console.log('WebSocket connection established');
			this.sendJoinRequest();
		};
		this.socket.onmessage = (event) => this.handleMessage(event);
		this.socket.onerror = (err) => console.error('WebSocket error:', err);
		this.socket.onclose = () => console.log('WebSocket connection closed');

		this.setupInputListeners();
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
            console.log(`Joined game ${data.gameId} as player ${data.playerId}`);
            if (this.joinResolve && data.gameId) {
                this.joinResolve(data.gameId);
                this.joinResolve = null;
            }
        }
    }
	private handleGameStateMessage(data: GameStateMessage) {
		// Mets à jour le canvas ou l'état du jeu ici
	}

	private setupInputListeners() {
		document.addEventListener('keydown', (event) => {
			if (!this.gameStarted || !this.playerId) return;
			if (event.key === 'ArrowUp' || event.key === 'ArrowDown') {
				const input: PlayerInputMessage['input'] = {
					up: event.key === 'ArrowUp',
					down: event.key === 'ArrowDown'
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
				input: input
			};
			this.socket.send(JSON.stringify(message));
		}
	}
}