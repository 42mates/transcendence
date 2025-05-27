import { initiateWSSConnection, connectToGame } from '../game/connection';
import { gameLoop } from '../game/gameplay';

export default function initGame() {
    console.log('Game page loaded');

    // initiateWSSConnection('ws://localhost:8080');
    // connectToGame('gameId', 'playerId');
    // gameLoop((data) => { ... });
}