import { WebSocket } from "ws";
import type { JoinRequest, JoinRequestPayload, JoinResponse} from "../types/GameMessages"; // Messages JSON

export default function join(wsSocket: WebSocket, message: JoinRequest) {
	console.log("Join message received:", message);
	const response: JoinResponse = {
		type: "join_response",
		status: "accepted",
		playerId: "CHANGEME", //! This should be replaced with actual player ID logic
		gameId: "CHANGEME", //! This should be replaced with actual game ID logic
		reason: null
	};
	wsSocket.send(JSON.stringify(response));
}
