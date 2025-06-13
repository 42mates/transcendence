import type { JoinResponse,
			  GameStatusUpdateMessage} from "../types/messages";

import { sendJoinResponse }            from "./join";
import { GameInstance }                from "../pong/game.class";
import { tournaments,
		 games,
		 onlineQueues,
		 TournamentBracketBackend, 
		 tnWinnersQueue,
		 tnLosersQueue}                from "../game/state";
import { User }                        from "./User";
import { getUniqueGameId }             from "../utils";
import { WaitingForPlayers,
		 TournamentNotFound }          from "./exceptions";
import { connect } from "http2";
import { connected } from "process";

export function getFrontendBracket(tournamentId: string): JoinResponse["tournament"] {
	if (!tournaments[tournamentId]) 
		throw new Error("Tournament not found");

	const t = tournaments[tournamentId];

	return {
		id: t.tournamentId,
		status: t.status,
		game1: {
			id: t.game1.id,
			status: t.game1.status,
			winner: t.game1.winner?.alias,
			loser: t.game1.loser?.alias,
		},
		game2: {
			id: t.game2.id,
			status: t.game2.status,
			winner: t.game2.winner?.alias,
			loser: t.game2.loser?.alias,
		},
		game3: t.game3
			? {
				id: t.game3.id,
				status: t.game3.status,
				winner: t.game3.winner?.alias,
				loser: t.game3.loser?.alias,
			}
			: {
				id: "",
				status: "pending",
			},
		game4: t.game4
			? {
				id: t.game4.id,
				status: t.game4.status,
				winner: t.game4.winner?.alias,
				loser: t.game4.loser?.alias,
			}
			: undefined,
	};
}

export function createTournament(user: User) {
	console.log("createTournament", user.alias);

	if (onlineQueues["tournament"].length < 4) 
		throw new WaitingForPlayers(user);	

	const players = onlineQueues["tournament"].splice(0, 4);
	const [p1, p2, p3, p4] = players;
	p1.playerId = "1";
	p2.playerId = "2";
	p3.playerId = "1";
	p4.playerId = "2";
	const gameId1 = getUniqueGameId();
	const gameId2 = getUniqueGameId();

	const tournamentId = getUniqueGameId();
	const backendBracket: TournamentBracketBackend = {
		tournamentId,
		status: "running",
		game1: new GameInstance([p1, p2], gameId1, "tournament", "pending", tournamentId),
		game2: new GameInstance([p3, p4], gameId2, "tournament", "pending", tournamentId),
		game3: null,
		game4: null,
	};

	tournaments[tournamentId] = backendBracket;

    games[gameId1] = backendBracket.game1;
    games[gameId2] = backendBracket.game2;

	tnWinnersQueue[tournamentId] = {w1_ready: false, w2_ready: false};
	tnLosersQueue[tournamentId] = {l1_ready: false, l2_ready: false};
	
	const frontendBracket = getFrontendBracket(tournamentId);
	sendJoinResponse(gameId1, frontendBracket);
	sendJoinResponse(gameId2, frontendBracket);
}

function sendTournamentStatusUpdate(tournamentId: string): void {
	const t = tournaments[tournamentId];

	if (!t || !t.game1 || !t.game2 || !t.game3 || !t.game4) return;

	const games = (t.game3.status === "ended" && t.game4.status === "ended") 
		? [t.game1, t.game2]
		: [t.game3, t.game4]; 

	if (!games[0] || !games[1]) return;
	for (const player of games[0].players) {
		player.send({
			type: "game_status_update",
			gameId: games[0].id,
			status: games[0].status,
			score: games[0].score,
			winner: games[0].winner?.alias,
			loser: games[0].loser?.alias,
			tournamentId: t.tournamentId,
			tournamentStatus: t.status,
			leaderboard: {
				first: t.game3.winner?.alias || undefined,
				second: t.game3.loser?.alias || undefined,
				third: t.game4?.winner?.alias || undefined,
			},
		} as GameStatusUpdateMessage);
	}
	for (const player of games[1].players) {
		player.send({
			type: "game_status_update",
			gameId: games[1].id,
			status: games[1].status,
			score: games[1].score,
			winner: games[1].winner?.alias,
			loser: games[1].loser?.alias,
			tournamentId: t.tournamentId,
			tournamentStatus: t.status,
			leaderboard: {
				first: t.game3.winner?.alias || undefined,
				second: t.game3.loser?.alias || undefined,
				third: t.game4?.winner?.alias || undefined,
			},
		} as GameStatusUpdateMessage);
	}
}

export function handleTournamentProgression(tournamentId: string): void {
	const t = tournaments[tournamentId];

	if (t.game1.status !== "ended" || t.game2.status !== "ended")
	{
		t.status = "waiting";
		return;
	}

	if (t.game3?.status === "ended" && t.game4?.status === "ended")
	{
		t.status = "ended";
		sendTournamentStatusUpdate(tournamentId);

		//TODO: remove players from connectedPlayers[]
		//TODO: remove games from games[]
		//TODO: remove tournament from tournaments[]
		return;
	}

	t.status = "running";
	t.game3 = new GameInstance(
		[t.game1.winner!, t.game2.winner!],
		getUniqueGameId(),
		"tournament",
		"pending",
		tournamentId
	);
	t.game4 = new GameInstance(
		[t.game1.loser!, t.game2.loser!],
		getUniqueGameId(),
		"tournament",
		"pending",
		tournamentId
	);

	games[t.game3.id] = t.game3;
	games[t.game4.id] = t.game4;

	sendTournamentStatusUpdate(tournamentId);
}