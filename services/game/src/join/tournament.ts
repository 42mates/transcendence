import type { JoinResponse,
			  GameUpdateMessage,
			  TournamentUpdateMessage} from "../types/messages";

import { sendJoinResponse }            from "./join";
import { GameInstance }                from "../pong/game.class";
import { tournaments,
		 games,
		 onlineQueues,
		 connectedUsers}               from "../game/state";
import { User }                        from "./User";
import { getUniqueGameId }             from "../utils";
import { WaitingForPlayers }           from "./exceptions";
import { removeConnectedUserFromDB }   from "../db/connectedUsers";



export default class Tournament {
	private _games: GameInstance[] = [];
	private _status: "waiting" | "running" | "ended" = "waiting"; // "waiting" means waiting for players to finish first two games
	private _winners: User[] = [];
	private _losers: User[] = [];

	get games(): GameInstance[] { return this._games; }
	get status(): "waiting" | "running" | "ended" { return this._status; }
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
			status: this._status,
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
				this._status = "waiting";

				// Create second round games
				this._winners = [this._games[0].winner!, this._games[1].winner!];
				this._losers = [this._games[0].loser!, this._games[1].loser!];
				this.createGame(this._winners);
				this.createGame(this._losers);

				for (const p of this._p)
					p.status = "idle";

				this.sendTournamentUpdate(0);
				this.sendTournamentUpdate(1);
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
				console.log(`[${this._id}] UNEXPECTED BEHAVIOUR: one game should be ended, but received: ${this._games[0].status}, ${this._games[1].status}`);
				this._status = "waiting";
				break;
		}
	}


	private tryStartFinale(players: User[], game_idx: number)
	{
		if (players.length !== 2) return;

		for (const user of players)
		{
			console.log(`[${this._id}] Checking user ${user.alias} status: ${user.status}`);
			if (user.status !== "queued") return;
		}

		console.log(`[${this._id}] Players ${players.map(p => p.alias).join(", ")} are ready for finale.`);

		players[0].status = "matched";
		players[1].status = "matched";
		this._status = "running"

		console.log(`[${this._id}] [join] Starting finale game with players: ${players.map(p => p.alias).join(", ")}`);
		sendJoinResponse(this._games[game_idx].id, this.getFormattedTournament());
	}

	private sendTournamentUpdate(idx: number)
	{
		const game = this._games[idx];
		if (!game) 
			throw new Error(`Game with index ${idx} does not exist in tournament ${this._id}`);

		for (const player of game.players)
		{
			player.send({
				type: "tournament_update",
				tournamentId: this._id,
				status: this.status,
			} as TournamentUpdateMessage);
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
				this._status = "waiting";
				this.sendTournamentUpdate(2);
				break;
			case "second":
				console.log(`[${this._id}] Waiting for game[2] to end.`);
				this._status = "waiting";
				this.sendTournamentUpdate(3);
				break;
			default:
				console.log(`[${this._id}] UNEXPECTED BEHAVIOUR: one game should be ended, but received: ${this._games[2].status}, ${this._games[3].status}`);
				this._status = "waiting";
				break;
		}
	}

	public update()
	{
		if (this._games.length == 2)
			this.handleFirstRound();
		else if (this._games.length !== 4)
			throw new Error(`Tournament ${this._id} has an invalid number of games: ${this._games.length}`);

		// First round is over at this point
		if (this._status === "waiting")
		{
			this.tryStartFinale(this._winners, 2);
			this.tryStartFinale(this._losers, 3);
		}
		else if (this._status === "running")
			this.handleTournamentEnd();
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
		this._status = "ended";

		this.sendEndUpdate();

		// Remove players from connectedPlayers[]
		for (const player of this._p) 
		{
			const idx = connectedUsers.indexOf(player);
			if (idx !== -1) 
			{
				connectedUsers.splice(idx, 1);
				removeConnectedUserFromDB(player.alias);
			}
		}

		// Remove games from games[]
		for (const game of this._games)
			if (games[game.id]) delete games[game.id];

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