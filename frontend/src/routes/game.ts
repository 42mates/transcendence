import { socket, joinGame } from '../game/connection';
import { gameLoop } from '../game/gameplay';

export function initGame() {
    console.log('Game page loaded');

	const wsUrl = `wss://${window.location.host}/api/game/join`;
	joinGame(wsUrl);

    // gameLoop((data) => { ... });
}