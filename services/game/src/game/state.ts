import { User } from "../join/User";
import { GameInstance } from "../pong/game.class";


export type TournamentBracketBackend = {
	tournamentId: string;
	status: "waiting" | "running" | "ended";
	game1: GameInstance;
	game2: GameInstance;
	game3: GameInstance | null;
	game4: GameInstance | null;
};

export const connectedUsers: User[] = [];

export const onlineQueues = {
	"1v1": [] as User[],
	"tournament": [] as User[],
};

export const tnWinnersQueue: { [tnId: string]: {w1_ready: boolean, w2_ready: boolean} } = {};
export const tnLosersQueue:  { [tnId: string]: {l1_ready: boolean, l2_ready: boolean} } = {};

export const games: {[gameId: string]: GameInstance } = {};
export const tournaments: { [tournamentId: string]: TournamentBracketBackend } = {};
