import Fastify from 'fastify';
import fs from 'fs';
import joinRoute from './routes/join';
import gameRoute from './routes/game';

export default async function startServer() {
	const fastify = Fastify({
		https: {
			key: fs.readFileSync('/etc/ssl/certs/game.key'),
			cert: fs.readFileSync('/etc/ssl/certs/game.crt'),
		},
	});

	// Pass the Fastify instance to joinRoute
	fastify.register(joinRoute);
	// Pass the Fastify instance to gameRoute
	fastify.register(gameRoute);

	try {
		await fastify.listen({port: 3001, host: '0.0.0.0'});
		fastify.log.info('game service is running on port 3001');
	} catch (err) {
		fastify.log.error(err);
		process.exit(1);
	}
}
