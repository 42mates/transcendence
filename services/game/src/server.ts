import Fastify, { type FastifyRequest } from "fastify";
import fs from 'fs';
import * as ws from "ws";

import { JoinRequest, PlayerInputMessage } from "./types/GameMessages";
import join from "./routes/join";
import action from "./routes/action";

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
				join(wsSocket, msg.payload as JoinRequest);
				break;
			case "action":
				action(wsSocket, msg.payload as PlayerInputMessage);
				break;
			default:
				wsSocket.send(JSON.stringify({ type: "error", payload: "Unknown type" }));
		}
	});

	wsSocket.on("close", () => {
		console.log("WebSocket connection closed");
	});

	wsSocket.on("error", (error) => {
		console.error(`WebSocket error: ${error}`);
	});
}


export default async function startServer() {
	const fastify = Fastify({
		https: {
			key: fs.readFileSync('/etc/ssl/certs/game.key'),
			cert: fs.readFileSync('/etc/ssl/certs/game.crt'),
		},
	});

	const server = fastify.server;

	const wss = new ws.Server({ server });

	wss.on("connection", (wsSocket) => {
		wsSocket.send("Successfully connected to the game service WebSocket server");
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