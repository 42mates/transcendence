export let socket: WebSocket | null = null;

export function initiateWSSConnection(url: string): void {
    socket = new WebSocket(url);
    socket.onopen = () => {
        console.log('WebSocket connection established');
    };
    socket.onerror = (err) => {
        console.error('WebSocket error:', err);
    };
    socket.onclose = () => {
        console.log('WebSocket connection closed');
    };
}

export function connectToGame(gameId: string, playerId: string): void {
    if (!socket || socket.readyState !== WebSocket.OPEN) {
        console.error('WebSocket is not connected');
        return;
    }
    const message = JSON.stringify({ type: 'join', gameId, playerId });
    socket.send(message);
}