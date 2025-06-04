import { GameInstance } from "./vars/game.class";
import { TournamentBracketBackend } from "../game/state";
import { GameStatusUpdateMessage } from "../types/messages";
import { games, tournaments } from "../game/state";
import { User } from "../join/User";



//function handleTournamentProgression(
//	tournamentId: string,
//	finishedGame: GameBackend,
//	winner: User,
//	loser: User,
//) {
//	const bracket = tournaments[tournamentId];
//	if (!bracket) return;

//	// Example: Place winners/losers in next games
//	if (finishedGame.id === bracket.game1.id) {
//		bracket.game3.players[0] = winner;
//		bracket.game4.players[0] = loser;
//	} else if (finishedGame.id === bracket.game2.id) {
//		bracket.game3.players[1] = winner;
//		bracket.game4.players[1] = loser;
//	}

//	// Start next games if both slots are filled
//	if (
//		bracket.game3.players[0] &&
//		bracket.game3.players[1] &&
//		bracket.game3.status === "waiting"
//	) {
//		runGame(bracket.game3, tournamentId);
//	}
//	if (
//		bracket.game4.players[0] &&
//		bracket.game4.players[1] &&
//		bracket.game4.status === "waiting"
//	) {
//		runGame(bracket.game4, tournamentId);
//	}
//}
