import type { WebSocket } from "ws";
import type { JoinResponse } from "../types/GameMessages";
import { ConnectedUser } from "../types/GameMessages";
import { games } from "../game/state";
import { getUniqueGameId } from "../utils";

// Création d'une nouvelle partie locale
export function createLocalGame(
    wsSocket: WebSocket,
    user: ConnectedUser,
    cleanAlias: string
) {
    const newGameId = getUniqueGameId();
    const response: JoinResponse = {
        type: "join_response",
        status: "accepted",
        playerId: "1",
        alias: cleanAlias,
        gameId: newGameId,
        reason: null,
    };
    wsSocket.send(JSON.stringify(response));
    games[newGameId] = {
        players: [user],
        id: newGameId,
        status: "pending",
    };
}

// Rejoindre une partie locale existante
export function joinLocalGame(
    wsSocket: WebSocket,
    user: ConnectedUser,
    cleanAlias: string,
    gameId: string
) {
    const existingGame = games[gameId];
    if (!existingGame || existingGame.players.length !== 1) {
        const response: JoinResponse = {
            type: "join_response",
            status: "rejected",
            playerId: null,
            alias: cleanAlias,
            gameId: null,
            reason: "Invalid or full local game",
        };
        wsSocket.send(JSON.stringify(response));
        return;
    }
    if (existingGame.players[0].alias === cleanAlias) {
        const response: JoinResponse = {
            type: "join_response",
            status: "rejected",
            playerId: null,
            alias: cleanAlias,
            gameId: null,
            reason: "Alias already in use in this game",
        };
        wsSocket.send(JSON.stringify(response));
        return;
    }
    existingGame.players.push(user);
    const response: JoinResponse = {
        type: "join_response",
        status: "accepted",
        playerId: "2",
        alias: cleanAlias,
        gameId,
        reason: null,
    };
    wsSocket.send(JSON.stringify(response));
}