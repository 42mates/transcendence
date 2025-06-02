import type { JoinRequest, JoinResponse, ConnectedUser } from "../types/GameMessages";

import { WebSocket }                                     from "ws";
import { connectedUsers, matchmakingQueues }             from "../game/state";
import { validateAlias,  }                               from "../join/alias";
import { createLocalGame, joinLocalGame }                from "../join/local";
import { tryMatchmake1v1, tryMatchmakeTournament }       from "../join/matchmaking";


export default function join(wsSocket: WebSocket, message: JoinRequest) {
	console.log("Join message received:", message);

	const mode = message.payload.mode;

	const cleanAlias = validateAlias(wsSocket, message);
	if (!cleanAlias) return; // Alias validation failed

	const user: ConnectedUser = {
		alias: cleanAlias,
		ws: wsSocket,
		gameMode: mode,
		status: "queued",
	};
	// Add user to connected users if online
	if (mode !== "local") connectedUsers.push(user);


	if (mode === "1v1" || mode === "tournament"){
		matchmakingQueues[mode].push(user);
		if (mode === "1v1")
			if (tryMatchmake1v1()) return;
		else
			if (tryMatchmakeTournament()) return; 
	} else if (mode === "local") {
		const { gameId } = message.payload;
		if (!gameId)
			createLocalGame(wsSocket, user, cleanAlias);
		else
			joinLocalGame(wsSocket, user, cleanAlias, gameId);
		return;
	}


	// If not matched yet, just acknowledge join
	const response: JoinResponse = {
		type: "join_response",
		status: "accepted",
		playerId: "1", // Player ID will be assigned later
		alias: cleanAlias,
		gameId: null,
		reason: null,
	};
	wsSocket.send(JSON.stringify(response));
}
