import type { JoinResponse } from "../types/messages";
import { User } from "../join/User";
import { games, localUsersWaiting } from "../game/state";
import { getUniqueGameId } from "../utils";
import { GameInstance } from "../pong/vars/game.class";
import { WaitingForPlayers } from "../routes/join";

export function createLocalGame(user: User) {
    const newGameId = getUniqueGameId();
    const response: JoinResponse = {
        type: "join_response",
        status: "accepted",
        playerId: "1",
        alias: user.alias,
        gameId: newGameId,
        reason: null,
    };
    user.send(response);
    localUsersWaiting[newGameId] = user;

	throw new WaitingForPlayers();
}

export function joinLocalGame(
    player2: User,
	gameId: string
) {
    const player1 = localUsersWaiting[gameId];
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

    games[gameId].players.push(player1);
    games[gameId].players.push(player2);
	games[gameId] = new GameInstance([player1, player2], gameId, "pending");

    const response: JoinResponse = {
        type: "join_response",
        status: "accepted",
        playerId: "2",
        alias: player2.alias,
        gameId,
        reason: null,
    };
    player2.send(response);
}