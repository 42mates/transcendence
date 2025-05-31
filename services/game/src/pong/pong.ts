import { Game, GameInstance } from "./vars/game.class.js";
import { GameBackend, TournamentBracketBackend } from "../game/state";
import { ConnectedUser, GameStatusUpdateMessage } from "../types/GameMessages";
import { games, tournaments } from "../game/state";

// fonction Game: => arg: GameBackend: (toutes les infos de la game)
// - return
//   - winner: playerX, looser: playerY,
//   - score: scoreX-scoreY,
// fonction tournois: => TournamentBracketBackend: (toutes les infos du tournoi)
// - call Game, for each game in the tournament.
// - at the end of a game get the winner and score, and place them in the new game:
//   - game 3: winnerGame1, winnerGame2
//   - game 4: looserGame1, looserGame2
export function startGame(
	params: GameBackend | TournamentBracketBackend,
): void {
	if (isGame(params)) {
		// Local or 1v1 game
		runGame(params);
	} else if (isTournament(params)) {
		// Tournament: start first two games
		runGame(params.game1, params.tournamentId);
		runGame(params.game2, params.tournamentId);
	}
}

// Type guards
function isGame(obj: any): obj is GameBackend {
	return obj && typeof obj.id === "string" && Array.isArray(obj.players);
}
function isTournament(obj: any): obj is TournamentBracketBackend {
	return (
		obj && typeof obj.tournamentId === "string" && obj.game1 && obj.game2
	);
}

// Game status table:
//  pending:	Game created, players matched, not started yet
//  waiting:	Game cannot start yet (e.g., waiting for previous games or players)
//  running:	Game is actively being played
// finished:	Game is over, results are final

function runGame(gameBackend: GameBackend, tournamentId?: string) {
	gameBackend.status = "running";
	broadcastGameStatus(gameBackend, tournamentId);

	// Example: Start the game loop (replace with your actual logic)
	const gameInstance = new GameInstance(gameBackend); // Pass the game object to your Game class
	requestAnimationFrame(gameInstance.gameLoop);

	// When the game ends, update status and notify clients
	gameInstance.onEnd = (winner: ConnectedUser, loser: ConnectedUser) => {
		gameBackend.status = "finished";
		gameBackend.winner = winner;
		gameBackend.loser = loser;
		broadcastGameStatus(gameBackend, tournamentId);

		// If tournament, handle progression
		if (tournamentId) {
			handleTournamentProgression(
				tournamentId,
				gameBackend,
				winner,
				loser,
			);
		}
	};
}

function broadcastGameStatus(game: GameBackend, tournamentId?: string) {
	const payload: GameStatusUpdateMessage = {
		type: "game_status_update",
		gameId: game.id,
		status: game.status,
		winner: game.winner?.alias,
		loser: game.loser?.alias,
		tournamentId,
	};
	game.players.forEach((player) => {
		player.ws.send(JSON.stringify(payload));
	});
}

function handleTournamentProgression(
	tournamentId: string,
	finishedGame: GameBackend,
	winner: ConnectedUser,
	loser: ConnectedUser,
) {
	const bracket = tournaments[tournamentId];
	if (!bracket) return;

	// Example: Place winners/losers in next games
	if (finishedGame.id === bracket.game1.id) {
		bracket.game3.players[0] = winner;
		bracket.game4.players[0] = loser;
	} else if (finishedGame.id === bracket.game2.id) {
		bracket.game3.players[1] = winner;
		bracket.game4.players[1] = loser;
	}

	// Start next games if both slots are filled
	if (
		bracket.game3.players[0] &&
		bracket.game3.players[1] &&
		bracket.game3.status === "waiting"
	) {
		runGame(bracket.game3, tournamentId);
	}
	if (
		bracket.game4.players[0] &&
		bracket.game4.players[1] &&
		bracket.game4.status === "waiting"
	) {
		runGame(bracket.game4, tournamentId);
	}
}

