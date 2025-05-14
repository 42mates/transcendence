import Fastify, { type FastifyRequest } from "fastify";
import FastifyWebsocket, { type WebSocket } from "@fastify/websocket";
import fs from 'fs';
import joinRoute from './routes/join';
import { WebSocketServer } from "ws";




// docker game logs
export default async function startServer() {

	// const fastify = initApp();
	const fastify = Fastify({
		https: {
			key: fs.readFileSync('/etc/ssl/certs/game.key'),
			cert: fs.readFileSync('/etc/ssl/certs/game.crt'),
		},
	});

    const server = fastify.server;
	
    const wss = new WebSocketServer({ server });

    wss.on("connection", (ws)=> {
        ws.send("PING PING!");
        ws.on("message", (msg) =>{
            // when there is new connection from browser
            console.log(`I RECIVED A MESSAGE FRON CLIENT: ${msg}`);
        })
    })


	fastify.register(joinRoute);

	try
	{
		await fastify.listen({ port: 3001, host: '0.0.0.0' });
		fastify.log.info('game service is running on port 3001');
	} catch (err) {
		fastify.log.error(err);
		process.exit(1);
	}
}

