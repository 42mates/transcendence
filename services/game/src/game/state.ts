import { ConnectedUser } from "../types/GameMessages";

export const connectedUsers: ConnectedUser[] = [];
export const matchmakingQueues = {
    "1v1": [] as ConnectedUser[],
    "tournament": [] as ConnectedUser[],
};
export const games: { [gameId: string]: { players: ConnectedUser[] } } = {};