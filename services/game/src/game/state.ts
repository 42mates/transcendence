import { ConnectedUser } from "../types/GameMessages";

export type GameBackend = {
	id: string;
	players: ConnectedUser[];
	status: "pending" | "waiting" | "running" | "finished";
	winner?: ConnectedUser;
	loser?: ConnectedUser;
	// Add more fields as needed (score, etc.)
};

export type TournamentBracketBackend = {
	tournamentId: string;
	game1: GameBackend;
	game2: GameBackend;
	game3: GameBackend;
	game4: GameBackend;
};

export const connectedUsers: ConnectedUser[] = [];
export const matchmakingQueues = {
	"1v1": [] as ConnectedUser[],
	"tournament": [] as ConnectedUser[],
};
export const games: { [gameId: string]: GameBackend } = {};
export const tournaments: { [tournamentId: string]: TournamentBracketBackend } = {};