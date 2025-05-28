export type JoinRequestPayload = {
	alias: string;
	mode: "1v1" | "tournament";
	gameId: string | null;
};

export type JoinRequest = {
	type: "join_request";
	payload: JoinRequestPayload;
};

export type JoinResponse = {
	type: "join_response";
	status: "accepted" | "rejected";
	playerId: string | null;
	gameId: string | null;
	reason: string | null;
};


export type PlayerInputMessage = {
	type: "player_input";
	playerId: string;
	input: {
		up: boolean;
		down: boolean;
	};
};

export type GameStateMessage = {
	type: "game_state";
	ball: { x: number; y: number };
	paddles: { x: number; y: number }[];
	score: [number, number];
	status: "running" | "ended" | string;
};