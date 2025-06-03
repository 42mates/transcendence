import { WebSocket } from "ws";
import type { PlayerInputMessage, GameStateMessage} from "../types/messages"; // Messages JSON
import { games } from "../game/state";
import { startGame } from "../pong/run";

export default function action(wsSocket: WebSocket, payload: PlayerInputMessage) {
	console.log("Action message received:", payload);

	if (payload.gameId === null || payload.playerId === null) {
		wsSocket.send(JSON.stringify({ type: "error", payload: { message: "Empty gameId or playerId" }}));
		return ;
	};

    const game = games[payload.gameId];
    if (!game) {
        wsSocket.send(JSON.stringify({ type: "error", payload: { message: "Game not found" } }));
        return;
    }

	
	//startGame(game, payload.playerId, payload.input);

	wsSocket.send(JSON.stringify({
		type: "action-success",
		payload: { message: "Action route accessed successfully" }
	}));
}


