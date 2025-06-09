/*******  JOIN MESSAGES  *******/

export type JoinRequest = {
	type: "join_request";
	payload: {
		alias: string[];
		mode: "1v1" | "tournament" | "local";
		gameId: string | null;
		avatar: string[]; // <-- Ajouté
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
	avatar?: string[]; // <-- Ajouté
	bracket?: {
	    game1: { id: string, players: [string, string], status: "pending" | "finished", winner?: string, loser?: string },
	    game2: { id: string, players: [string, string], status: "pending" | "finished", winner?: string, loser?: string },
	    game3: { id: string, players?: [string, string], status: "pending" | "waiting" | "finished", winner?: string, loser?: string },
	    game4: { id: string, players?: [string, string], status: "pending" | "waiting" | "finished", winner?: string, loser?: string }
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
	status: "running" | "ended" | string;
};


export type GameStatusUpdateMessage = {
    type: "game_status_update";
    gameId: string;
    status: "pending" | "waiting" | "running" | "ended";
    winner?: string;
    loser?: string;
    tournamentId?: string;
};


export type GameErrorType = {
	type: "game_error";
	gameId?: string;
	playerId?: "1" | "2" | null;
	message: string;
};