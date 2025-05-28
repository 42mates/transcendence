import type { JoinRequest, JoinResponse, PlayerInputMessage, GameStateMessage } from '../types/GameMessages';

export let socket: WebSocket | null = null;

export function joinGame(url: string): void {
	socket = new WebSocket(url);
	socket.onopen = () => {
		console.log('WebSocket connection established');
		sendJoinRequest('local', Math.random().toString(36).slice(2, 10));
	};

	socket.onmessage = (event) => {
		console.log('Message received from server:', event.data);
		//const message: JoinResponse | GameStateMessage = JSON.parse(event.data);
	};
	socket.onerror = (err) => {
		console.error('WebSocket error:', err);
	};
	socket.onclose = () => {
		console.log('WebSocket connection closed');
	};
}

export function sendJoinRequest(gameMode: "1v1" | "tournament" | "local", playerId: string): void {
	if (!socket || socket.readyState !== WebSocket.OPEN) {
		console.error('[sendJoinRequest] WebSocket is not connected');
		return;
	}
	const message: JoinRequest = {
		type: "join_request",
		payload: {
			alias: playerId,
			mode: gameMode,
			gameId: "idk",
		},
	};
	socket.send(JSON.stringify(message));

}
