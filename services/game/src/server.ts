import Fastify from 'fastify';
import fs from 'fs';
import joinRoute from './routes/join';
// import FastifyWebsocket from '@fastify/websocket';
const FastifyWebsocket = require("@fastify/websocket");
import { FastifyPluginAsync, FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { SocketStream } from 'fastify-websocket';

export default async function startServer() {

	// const app = Fastify({ logger: true });
	const app = Fastify({
		https: {
			key: fs.readFileSync('/etc/ssl/certs/game.key'),
			cert: fs.readFileSync('/etc/ssl/certs/game.crt'),
		},
	});

	app.register(FastifyWebsocket);
	app.register(async function (Fastify) {
		Fastify.get('/join', { websocket: true }, (connection :SocketStream, req /* FastifyRequest */) => {
		connection.socket.on('message', (message: unknown) => {
			// message.toString() === 'hi from client'
			connection.socket.send('hi from server')
		})
		})
	})

	app.ready().then(() => app.listen({ port: 3001, host: '0.0.0.0' }))
}


// docker game logs
// export default async function startServer() {

// 	// const fastify = initApp();
// 	const fastify = Fastify({
// 		https: {
// 			key: fs.readFileSync('/etc/ssl/certs/game.key'),
// 			cert: fs.readFileSync('/etc/ssl/certs/game.crt'),
// 		},
// 	});
// 	fastify.register(FastifyWebsocket);

// fastify.get('/join', { websocket: true }, (connection, req) => {
//   connection.socket.on('message', message => {
//     // message === 'hi from client'
//     connection.socket.send('hi from server')
//   })
// })



// 	// fastify.register(joinRoute);

// 	try
// 	{
// 		await fastify.listen({ port: 3001, host: '0.0.0.0' });
// 		fastify.log.info('game service is running on port 3001');
// 	} catch (err) {
// 		fastify.log.error(err);
// 		process.exit(1);
// 	}
// }

