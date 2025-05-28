import { WebSocket } from "ws";
import type { PlayerInputMessage, GameStateMessage} from "../types/GameMessages"; // Messages JSON

export default function action(wsSocket: WebSocket, payload: PlayerInputMessage) {
	console.log("Action message received:", payload);
	wsSocket.send(JSON.stringify({
		type: "action-success",
		payload: { message: "Action route accessed successfully" }
	}));
}
