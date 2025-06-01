export type JoinRequestPayload = {
	alias: string;
	mode: "1v1" | "tournament" | "local";
	gameId: string | null;
};

export type JoinRequest = {
	type: "join_request";
	payload: JoinRequestPayload;
};

export type TournamentBracket = {
    game1: { id: string, players: [string, string], status: "pending" | "finished", winner?: string, loser?: string },
    game2: { id: string, players: [string, string], status: "pending" | "finished", winner?: string, loser?: string },
    game3: { id: string, players: [string, string], status: "pending" | "waiting" | "finished", winner?: string, loser?: string },
    game4: { id: string, players: [string, string], status: "pending" | "waiting" | "finished", winner?: string, loser?: string }
};

export type JoinResponse = {
	type: "join_response";
	status: "accepted" | "rejected";
	alias: string | null;
	playerId: "1" | "2" | null;
	gameId: string | null;
	reason: string | null;
	bracket?: TournamentBracket; // <-- add this line
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

import * as ws from "ws";
export type ConnectedUser = {
	alias: string;
	ws: ws.WebSocket;
	gameMode: "1v1" | "tournament" | "local";
	status: "idle" | "queued" | "matched";
};

export type GameStatusUpdateMessage = {
    type: "game_status_update";
    gameId: string;
    status: "pending" | "waiting" | "running" | "finished";
    winner?: string;
    loser?: string;
    tournamentId?: string;
};