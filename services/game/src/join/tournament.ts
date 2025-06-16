import type { JoinResponse, GameUpdateMessage, TournamentUpdateMessage} from "../types/messages";

import { sendJoinResponse } from "./join";
import { GameInstance } from "../pong/game.class";
import { tournaments, games, onlineQueues, connectedUsers} from "../game/state";
import { User } from "./User";
import { getUniqueGameId } from "../utils";
import { WaitingForPlayers } from "./exceptions";
import { removeConnectedUserFromDB } from "../db/connectedUsers";



export default class Tournament {
	private _games: GameInstance[] = [];
	private _status: "waiting" | "finale_ready" | "running" | "ended" = "waiting"; // "waiting" means waiting for players to finish first two games
	private _winners: User[] = [];
	private _losers: User[] = [];

	get games(): GameInstance[] { return this._games; }
	get status(): "waiting" | "finale_ready" | "running" | "ended" { return this._status; }
	get id(): string { return this._id; }
	get players(): User[] { return this._p; }
	get winners(): User[] { return this._winners; }
	get losers(): User[] { return this._losers; }

	constructor(
		private _id: string,
		private _p: User[],
	) {
		if (this._p.length !== 4) 
			throw new Error("Tournament must have exactly 4 players");

		tournaments[this._id] = this;
	
		console.log(`[${this._id}] Tournament initialized with players: ${this._p.map(p => p.alias).join(", ")}`);
	}

	public start() {
		this._p[0].playerId = "1";
		this._p[1].playerId = "2";
		this._p[2].playerId = "1";
		this._p[3].playerId = "2";
		
		this.createGame([this._p[0], this._p[1]]);
		this.createGame([this._p[2], this._p[3]]);

		this._status = "running";

		const formatted = this.getFormattedTournament();
		sendJoinResponse(this._games[0].id, formatted);
		sendJoinResponse(this._games[1].id, formatted);
	}

	private createGame(players: User[]) 
	{
		if (players.length !== 2)
			throw new Error("Tournament game must have exactly 2 players");

		const gameId = getUniqueGameId();
		const game = new GameInstance(players, gameId, "tournament", "pending", this._id);

		this._games.push(game);

		games[gameId] = game;

		console.log(`[${this._id}] Game "${gameId}" created for players: ${players.map(p => p.alias).join(", ")}`); 
	}

	private getFormattedTournament(): JoinResponse["tournament"] 
	{
		return {
			id: this._id,
			status: this._status as "waiting" | "running" | "ended",
			game1: {
				id: this._games[0].id,
				status: this._games[0].status,
				winner: this._games[0].winner?.alias,
				loser: this._games[0].loser?.alias,
			},
			game2: {
				id: this._games[1].id,
				status: this._games[1].status,
				winner: this._games[1].winner?.alias,
				loser: this._games[1].loser?.alias,
			},
			game3: this._games[2]
				? {
					id: this._games[2].id,
					status: this._games[2].status,
					winner: this._games[2].winner?.alias,
					loser: this._games[2].loser?.alias,
				}
				: {
					id: "",
					status: "pending",
				},
			game4: this._games[3]
				? {
					id: this._games[3].id,
					status: this._games[3].status,
					winner: this._games[3].winner?.alias,
					loser: this._games[3].loser?.alias,
				}
				: undefined,
		};
	}

	private hasEnded(first: number, second: number): string
	{
		if (first < 0 || first >= this._games.length || second < 0 || second >= this._games.length)
			throw new Error(`Invalid game indices: ${first}, ${second}`);

		if (this._games[first].status === "ended" && this._games[second].status === "ended")
			return "both";
		else if (this._games[first].status === "ended")
			return "first";
		else if (this._games[second].status === "ended")
			return "second";
		else
			return "none";
	}

	private handleFirstRound()
	{
		switch (this.hasEnded(0, 1)) {
			case "both":
				console.log(`[${this._id}] Both first round games ended. Starting second round.`);

				// both games ended, so second round is ready
				this._status = "finale_ready";

				// Create second round games
				this._winners = [this._games[0].winner!, this._games[1].winner!];
				this._losers = [this._games[0].loser!, this._games[1].loser!];
				this.createGame(this._winners);
				this.createGame(this._losers);



				for (const p of this._p)
					if (p.status !== "quit") 
						p.status = "idle";

				this.sendTournamentUpdate(0);
				this.sendTournamentUpdate(1);

				// If any player in game[2] or game[3] has status "quit", set game status to "ended"
				for (const game of [this._games[2], this._games[3]])
				{
					if (game){

						const quitter = game.players.find(p => p.status === "quit");
						if (quitter)
							game.quit(quitter);
					}
				}

				break;
			case "first":
				console.log(`[${this._id}] Waiting for game[1] to end.`);
				this._status = "waiting";
				this.sendTournamentUpdate(0);
				break;
			case "second":
				console.log(`[${this._id}] Waiting for game[0] to end.`);
				this._status = "waiting";
				this.sendTournamentUpdate(1);
				break;
			default:
				throw new Error(`[${this._id}] UNEXPECTED BEHAVIOUR: one game should be ended, but received: ${this._games[0].status}, ${this._games[1].status}`);
		}
	}


	private tryStartFinale(players: User[], game_idx: number)
	{
		console.log(`[${this._id}] Trying to start finale for game[${game_idx}] with players: ${players.map(p => `${p.alias} (${p.status})`).join(", ")}`);
		if (players.length !== 2) return;

		const game = this._games[game_idx];
		console.log(`[${this._id}] Game[${game_idx}] status: ${game.status}`);

		if (game.status === "ended")
		{
			for (const player of game.players)
				if (player.status !== "quit") 
					player.send(game.getState());
			return;
		}

		for (const user of players)
			if (user.status !== "queued") return;

		console.log(`[${this._id}] Players ${players.map(p => p.alias).join(", ")} are ready for finale.`);

		players[0].status = "matched";
		players[1].status = "matched";

		console.log(`[${this._id}] [join] Starting finale game with players: ${players.map(p => p.alias).join(", ")}`);
		sendJoinResponse(game.id, this.getFormattedTournament());
	}

	private sendTournamentUpdate(idx: number)
	{
		const game = this._games[idx];
		if (!game) 
			throw new Error(`Game with index ${idx} does not exist in tournament ${this._id}`);

		for (const player of game.players)
		{
			let isOpponentOnline = true;
			if (idx === 2 || idx === 3)
			{
				const opponent = game.players.find(p => p.alias !== player.alias);
				if (opponent!.status === "quit")
					isOpponentOnline = false;
				console.log(`[${this._id}] Opponent ${opponent!.alias} is ${isOpponentOnline ? "online" : "offline"} for player ${player.alias}`);
			}

			player.send({
				type: "tournament_update",
				tournamentId: this._id,
				status: this.status,
				isOpponentOnline: isOpponentOnline
			} as TournamentUpdateMessage)
		}
		console.log(`[${this._id}] Sent update (status: ${this._status}) for game ${game.id} to players: ${game.players.map(p => p.alias).join(", ")}`);
	}

	private handleTournamentEnd()
	{
		switch (this.hasEnded(2, 3)) 
		{
			case "both":
				this.end();
				break;
			case "first":
				console.log(`[${this._id}] Waiting for game[3] to end.`);
				this.sendTournamentUpdate(2);
				break;
			case "second":
				console.log(`[${this._id}] Waiting for game[2] to end.`);
				this.sendTournamentUpdate(3);
				break;
			default:
				throw new Error(`[${this._id}] UNEXPECTED BEHAVIOUR: one game should be ended, but received: ${this._games[2].status}, ${this._games[3].status}`);
		}
	}

	public update()
	{
		if (this._games.length == 2)
			this.handleFirstRound();
		else if (this._games.length !== 4)
			throw new Error(`Tournament ${this._id} has an invalid number of games: ${this._games.length}`);

		if (this._games.length < 4) return;

		if (this._games[2].status === "ended" && this._games[3].status === "ended")
			this.handleTournamentEnd();

		// First round is over at this point
		if (this._status === "finale_ready")
		{
			this.tryStartFinale(this._winners, 2);
			this.tryStartFinale(this._losers, 3);
		}
	}

	private sendEndUpdate()
	{
		for (const player of this._p)
		{
			player.send({
				type: "tournament_update",
				tournamentId: this._id,
				status: this.status,
				leaderboard: {
					first: this._games[2]?.winner?.alias!,
					second: this._games[2]?.loser?.alias!,
					third: this._games[3]?.winner?.alias!,
				},
			} as TournamentUpdateMessage);
		}
	}

	private end() {
		console.log(`[${this._id}] Ending tournament with players: ${this._p.map(p => p.alias).join(", ")}`);
		this._status = "ended";

		this.sendEndUpdate();

		// Remove tournament from tournaments[]
		if (tournaments[this._id]) delete tournaments[this._id];

		console.log(`[${this._id}] Tournament ended with winners: ${this._games[2].winner?.alias}, ${this._games[3].winner?.alias}`);
	}
}

export function createTournament(user: User): Tournament {

	if (onlineQueues["tournament"].length < 4) 
		throw new WaitingForPlayers(user);	

	const players = onlineQueues["tournament"].splice(0, 4);
	const tournamentId = getUniqueGameId();

	const tournament = new Tournament(tournamentId, players);

	return tournament;
}