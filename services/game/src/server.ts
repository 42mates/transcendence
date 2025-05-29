import Fastify, { type FastifyRequest } from "fastify";
import fs from 'fs';
import * as ws from "ws";

import { JoinRequest, PlayerInputMessage } from "./types/GameMessages";
import join from "./routes/join";
import action from "./routes/action";
import aliasCheckRoute from "./routes/check-alias";
import { connectedUsers, matchmakingQueues, games } from "./game/state";

function handleWSS(wsSocket: ws.WebSocket) {
	wsSocket.on("message", (data: ws.RawData) => {
		console.log("Received message:", data.toString());
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
				join(wsSocket, msg as JoinRequest);
				break;
			case "action":
				action(wsSocket, msg.payload as PlayerInputMessage);
				break;
			default:
				wsSocket.send(JSON.stringify({ type: "error", payload: "Unknown type" }));
		}
	});

	wsSocket.on("close", () => {
		handleDisconnect(wsSocket);
	});

	wsSocket.on("error", (error) => {
		console.error(`WebSocket error: ${error}`);
	});
}

function handleDisconnect(wsSocket: ws.WebSocket) {
	console.log("WebSocket connection closed");
	const idx = connectedUsers.findIndex(u => u.ws === wsSocket);
	if (idx !== -1) {
		const user = connectedUsers[idx];
		// Remove from queue if queued
		if (user.gameMode === "1v1" || user.gameMode === "tournament") {
			const queue = matchmakingQueues[user.gameMode];
			const qIdx = queue.findIndex(u => u.alias === user.alias);
			if (qIdx !== -1) queue.splice(qIdx, 1);
		}
		// Remove from connected users
		connectedUsers.splice(idx, 1);
		for (const [gameId, game] of Object.entries(games)) {
			const idx = game.players.indexOf(user.alias);
			if (idx !== -1) {
				game.players.splice(idx, 1);
				if (game.players.length === 0) {
					delete games[gameId];
				}
			}
		}
	}
}


export default async function startServer() {
	const fastify = Fastify({
		https: {
			key: fs.readFileSync('/etc/ssl/certs/game.key'),
			cert: fs.readFileSync('/etc/ssl/certs/game.crt'),
		},
	});

	const server = fastify.server;

	fastify.register(aliasCheckRoute);

	const wss = new ws.Server({ server });

	wss.on("connection", (wsSocket) => {
		wsSocket.send(JSON.stringify({ type: "info", payload: "Successfully connected to the game service WebSocket server" }));
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