import Fastify, { type FastifyRequest } from "fastify";
import fs, { stat } from 'fs';
import * as ws from "ws";

import { JoinRequest, PlayerInputMessage } from "./types/messages";
import join            from "./join/join";
import { User }        from "./join/User";
import input           from "./routes/input";

import aliasCheckRoute from "./routes/check-alias";
import joinRoute       from "./routes/join";
import stateRoute      from "./routes/state";
import { inputRoute } from "./routes/input";


import { connectedUsers, onlineQueues, games } from "./game/state";

function handleWSS(wsSocket: ws.WebSocket) {
	wsSocket.on("message", (data: ws.RawData) => {
		let msg;
		try {
			msg = JSON.parse(data.toString());
		}
		catch (e) {
			wsSocket.send(JSON.stringify({ type: "error", payload: "Invalid JSON" }));
			return;
		}

		switch (msg.type) {
			case "join_request":
				join(msg as JoinRequest, wsSocket);
				break;
			case "player_input":
				input(msg as PlayerInputMessage, wsSocket);
				break;
			default:
				wsSocket.send(JSON.stringify({ type: "error", payload: "Unknown type" }));
		}
	});

	wsSocket.on("close", () => {
		handleWebSocketDisconnect(wsSocket);
	});

	wsSocket.on("error", (error: string) => {
		console.error(`WebSocket error: ${error}`);
	});
}

function handleWebSocketDisconnect(wsSocket: ws.WebSocket) {
	console.log("WebSocket connection closed");
	const idx = connectedUsers.findIndex(u => u.connection === wsSocket);
	if (idx !== -1) {
		const user = connectedUsers[idx];
		// Remove from queue if queued
		if (user.gameMode === "1v1" || user.gameMode === "tournament") {
			const queue = onlineQueues[user.gameMode];
			const qIdx = queue.findIndex(u => u.alias === user.alias);
			if (qIdx !== -1) queue.splice(qIdx, 1);
		}
		// Remove from connected users
		connectedUsers.splice(idx, 1);
		for (const [gameId, game] of Object.entries(games)) {
			const idx = game.players.findIndex((u: User) => u.alias === user.alias); // ✅ compare by alias property
			if (idx !== -1) {
				game.players.splice(idx, 1);
				if (game.players.length === 0) {
					delete games[gameId];
				}
			}
		}
	}
}

//function handleHTTPDisconnect(req: FastifyRequest, reply: FastifyReply) {
//	const alias = req.query.alias as string;
//	const idx = connectedUsers.findIndex(u => u.alias === alias);
//	if (idx !== -1) {
//		const user = connectedUsers[idx];
//		// Remove from queue if queued
//		if (user.gameMode === "1v1" || user.gameMode === "tournament") {
//			const queue = onlineQueues[user.gameMode];
//			const qIdx = queue.findIndex(u => u.alias === user.alias);
//			if (qIdx !== -1) queue.splice(qIdx, 1);
//		}
//		// Remove from connected users
//		connectedUsers.splice(idx, 1);
//		for (const [gameId, game] of Object.entries(games)) {
//			const idx = game.players.findIndex(u => u.alias === user.alias); // ✅ compare by alias property
//			if (idx !== -1) {
//				game.players.splice(idx, 1);
//				if (game.players.length === 0) {
//					delete games[gameId];
//				}
//			}
//		}
//		reply.status(200).send({ message: "Disconnected successfully" });
//	}
//	else {
//		reply.status(404).send({ message: "User not found" });
//	}
//}


export default async function startServer() {
	const fastify = Fastify({
		https: {
			key: fs.readFileSync('/etc/ssl/certs/game.key'),
			cert: fs.readFileSync('/etc/ssl/certs/game.crt'),
		},
	});

	const server = fastify.server;

	fastify.register(aliasCheckRoute);
	fastify.register(joinRoute);
	fastify.register(stateRoute);
	fastify.register(inputRoute);

	const wss = new ws.Server({ server });

	wss.on("connection", (wsSocket: ws.WebSocket) => {
		console.log("New WebSocket connection established");
		handleWSS(wsSocket);
	});

	try {
		await fastify.listen({ port: 3001, host: '0.0.0.0' });
		console.log('game service is running on port 3001');
	} catch (err) {
		console.error(err);
		process.exit(1);
	}
}