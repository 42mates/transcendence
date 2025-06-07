
import Game from '../game/Game';
import GameForm from '../game/GameForm';

export async function initGame() {
	try {
		const form = new GameForm();
		const data = await form.getGameForm();

		let game: Game;
		if (data.mode === 'online')
			game = new Game(data.onlineType, data.alias);
		else if (data.mode === 'local')
			game = new Game('local', data.alias, null, [{up: 'w', down: 's'}, {up: 'ArrowUp', down: 'ArrowDown'}]);
		else
			throw new Error("Invalid game mode selected");

		game.connect();
		await game.waitForJoin();

		if (data.mode === 'online') console.log(`[${game.gameId}] Player ${data.alias} connected.`);
		if (data.mode === 'local')  console.log(`[${game.gameId}] Local game started for players: '${data.alias.join(' and ')}'`);
	}
	catch (error) {
		console.error('Error:', error);
	}
}