import { socket } from './connection';

export function gameLoop(onMove: (data: any) => void): void {
    if (!socket) {
        console.error('WebSocket is not connected');
        return;
    }
    socket.onmessage = (event) => {
        const data = JSON.parse(event.data);
        onMove(data);
    };
}