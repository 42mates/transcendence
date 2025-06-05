
import Game from '../game/Game';
import GameForm from '../game/GameForm';
import { GameFormType } from '../types/GameForm';

async function playOnline(data: Extract<GameFormType, { mode: "online" }>) {
	let game = new Game(data.onlineType, data.alias);
	game.connect();
    await game.waitForJoin();
	console.log(`[${game.gameId}] Player ${data.alias} connected.`);
}

async function playLocal(data: Extract<GameFormType, { mode: "local" }>) {
	try {
		let game1 = new Game("local", data.alias1, null, { up: "w", down: "s" });
		game1.connect();
		let gameId = await game1.waitForJoin();
		console.log(`[${gameId}] First player ${data.alias1} connected.`);
		let game2 = new Game("local", data.alias2, gameId);
		game2.connect();
		console.log(`[${gameId}] Second player ${data.alias1} connected.`);
	}
	catch (error) {
		console.error('Error starting local game:', error);
		if (error instanceof Error) {
			alert(error.message);
		} else {
			alert('An unknown error occurred while starting the local game.');
		}
	}
}

export async function initGame() {
	try {
		const form = new GameForm();
		const data = await form.getGameForm();
		if (data.mode === 'online')
			playOnline(data);
		else
			playLocal(data);
	}
	catch (error) {
		console.error('Error:', error);
	}
}