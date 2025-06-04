import { User } from "../join/User";

export type GameBackend = {
	id: string;
	players: User[];
	status: "pending" | "waiting" | "running" | "finished";
	winner?: User;
	loser?: User;
	// Add more fields as needed (score, etc.)
};

export type TournamentBracketBackend = {
	tournamentId: string;
	game1: GameBackend;
	game2: GameBackend;
	game3: GameBackend;
	game4: GameBackend;
};

export const connectedUsers: User[] = [];

export const matchmakingQueues = {
	"1v1": [] as User[],
	"tournament": [] as User[],
};

export const games: { [gameId: string]: GameBackend } = {};

export const tournaments: { [tournamentId: string]: TournamentBracketBackend } = {};
