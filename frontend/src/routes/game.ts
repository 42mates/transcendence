
import Game from '../game/Game';
import { GameForm } from '../game/form';
import { GameFormType } from '../types/GameForm';

async function playOnline(data: Extract<GameFormType, { mode: "online" }>) {
	let game = new Game(data.onlineType, data.alias);
	game.connect();
    await game.waitForJoin();
}

async function playLocal(data: Extract<GameFormType, { mode: "local" }>) {
	let game1 = new Game("local", data.alias1);
    game1.connect();
    let gameId = await game1.waitForJoin();
    console.log('gameId:', gameId);
    let game2 = new Game("local", data.alias2, gameId);
    game2.connect();
	console.log('Local game started with aliases:', data.alias1, data.alias2);
}

export async function initGame() {
    console.log('Game page loaded');

	const form = new GameForm();
	const data = await form.getGameForm();
	console.log('Game form data:', data);
	if (data.mode === 'online')
		playOnline(data);
	else
		playLocal(data);

}