import type { JoinResponse } from "../types/messages";
import { User }              from "../join/User";
import { localQueue } from "../game/state";
import { getUniqueGameId }   from "../utils";
import { joinGame }          from "./join";
import { WaitingForPlayers } from "./exceptions";

export function createLocalGame(user: User) {
    const newGameId = getUniqueGameId();

    localQueue[newGameId] = user;

	throw new WaitingForPlayers(user, newGameId);
}

export function joinLocalGame(player2: User, gameId: string) {
    const player1 = localQueue[gameId];
    if (!player1) {
        const response: JoinResponse = {
            type: "join_response",
            status: "rejected",
            playerId: null,
            alias: player2.alias,
            gameId: null,
            reason: "Invalid or full local game",
        };
        player2.send(response);
        return;
    }

	joinGame([player1, player2], gameId);
}