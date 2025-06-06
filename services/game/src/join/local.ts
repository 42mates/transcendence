import type { WebSocket } from "ws";
import type { JoinResponse } from "../types/messages";
import { User } from "../join/User";
import { games } from "../game/state";
import { getUniqueGameId } from "../utils";

// Création d'une nouvelle partie locale
export function createLocalGame(
    user: User,
) {
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
    games[newGameId] = {
        players: [user],
        id: newGameId,
        status: "pending",
    };
}

// Rejoindre une partie locale existante
export function joinLocalGame(
    user: User,
	gameId: string
) {
    const existingGame = games[gameId];
    if (!existingGame || existingGame.players.length !== 1) {
        const response: JoinResponse = {
            type: "join_response",
            status: "rejected",
            playerId: null,
            alias: user.alias,
            gameId: null,
            reason: "Invalid or full local game",
        };
        user.send(response);
        return;
    }
    if (existingGame.players[0].alias === user.alias) {
        const response: JoinResponse = {
            type: "join_response",
            status: "rejected",
            playerId: null,
            alias: user.alias,
            gameId: null,
            reason: "Alias already in use in this game",
        };
        user.send(response);
        return;
    }
    existingGame.players.push(user);
    const response: JoinResponse = {
        type: "join_response",
        status: "accepted",
        playerId: "2",
        alias: user.alias,
        gameId,
        reason: null,
    };
    user.send(response);
}