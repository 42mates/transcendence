import { User } from "../join/User";
import { GameInstance } from "../pong/game.class";


export type TournamentBracketBackend = {
	tournamentId: string;
	game1: GameInstance;
	game2: GameInstance;
	game3: GameInstance | null;
	game4: GameInstance | null;
};

export const connectedUsers: User[] = [];

export const localQueue: {[gameId: string]: User } = {};
export const onlineQueues = {
	"1v1": [] as User[],
	"tournament": [] as User[],
};

export const games: {[gameId: string]: GameInstance } = {};
export const tournaments: { [tournamentId: string]: TournamentBracketBackend } = {};
