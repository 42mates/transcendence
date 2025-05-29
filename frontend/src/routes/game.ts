
import Game from '../game/Game';
import { GameForm } from '../game/form';
import { GameFormType } from '../types/GameForm';

export async function initGame() {
    console.log('Game page loaded');

	const form = new GameForm();
	const formData = await form.getGameForm();
	console.log('Game form data:', formData);
	let game: Game | undefined;
	if (formData.mode === 'online')
		game = new Game(formData.onlineType, formData.alias);
	else
		game = new Game('1v1', formData.alias1);

	game.connect();
}