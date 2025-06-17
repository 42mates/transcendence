/*******  JOIN MESSAGES  *******/

export type JoinRequest = {
	type: "join_request";
	payload: {
		alias: string[];
		mode: "1v1" | "tournament" | "local";
		gameId: string | null;
		avatar: string[];
		tournamentId?: string;
	}
};

export type JoinResponse = {
	type: "join_response";
	status: "accepted" | "waiting" | "rejected";
	aliases: string[] | null;
	playerId: "1" | "2" | null;
	gameId: string | null;
	reason: string | null;
	dimensions?: {
		height: number;
		width: number;
		paddleWidth: number;
		paddleHeight: number;
		ballSize: number;
	};
	avatar?: string[];
	tournament?: {
		id: string;
		status: "waiting" | "running" | "ended";
		game1: { id: string, status: "pending" | "waiting" | "running" | "ended", winner?: string, loser?: string },
		game2: { id: string, status: "pending" | "waiting" | "running" | "ended", winner?: string, loser?: string },
		game3?: { id: string, status: "pending" | "waiting" | "running" | "ended", winner?: string, loser?: string },
		game4?: { id: string, status: "pending" | "waiting" | "running" | "ended", winner?: string, loser?: string }
	}
};

/*******  GAME MESSAGES  *******/

export type PlayerInputMessage = {
	type: "player_input";
	playerId: "1" | "2" | null;
	gameId: string | null;
	input: {
		up: boolean;
		down: boolean;
	}[];
};


export type GameStateMessage = {
	type: "game_state";
	ball: { x: number; y: number };
	paddles: { x: number; y: number }[];
	score: [number, number];
	status: "pending" | "waiting" | "running" | "ended";
};


export type GameUpdateMessage = {
	type: "game_update";
	gameId: string;
	status: "pending" | "waiting" | "running" | "ended";
	score: [number, number];
	winner?: string;
	loser?: string;
};

export type TournamentUpdateMessage = {
	type: "tournament_update";
	tournamentId: string;
	status: "waiting" | "finale_ready" | "running" | "ended";
	isOpponentOnline: boolean;
	leaderboard?: { first: string; second: string; third: string };
};

export type GameErrorType = {
	type: "game_error";
	gameId?: string;
	playerId?: "1" | "2" | null;
	message: string;
};


/*******  QUIT MESSAGES  *******/

export type QuitRequest = {
	type: "quit_request";
	alias: string;
	playerId?: "1" | "2";
	gameId?: string;
	reason?: string;
};

export type QuitResponse = {
	type: "quit_response";
	alias: string;
	playerId?: "1" | "2";
	gameId?: string;
	status: "success" | "failure";
	message?: string;
};