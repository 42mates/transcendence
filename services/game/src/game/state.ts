import { User } from "../join/User";
import { GameInstance } from "../pong/vars/game.class";


export type TournamentBracketBackend = {
	tournamentId: string;
	game1: GameInstance;
	game2: GameInstance;
	game3: GameInstance | null;
	game4: GameInstance | null;
};

export const connectedUsers: User[] = [];

export const matchmakingQueues = {
	"1v1": [] as User[],
	"tournament": [] as User[],
};

export const games: {[gameId: string]: GameInstance } = {};

export const localUsersWaiting: {[gameId: string]: User } = {};

export const tournaments: { [tournamentId: string]: TournamentBracketBackend } = {};
