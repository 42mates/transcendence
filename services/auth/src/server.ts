import Fastify from 'fastify';
import fs from 'fs';
import loginRoute from './routes/login';
import doesuserexistRoute from './routes/doesuserexist';

export default async function startServer() {
	const fastify = Fastify({
		https: {
			key: fs.readFileSync('/etc/ssl/certs/auth.key'),
			cert: fs.readFileSync('/etc/ssl/certs/auth.crt'),
		},
	});

	fastify.register(loginRoute);

	try {
		await fastify.listen({ port: 3000, host: '0.0.0.0' });
		fastify.ready().then(() => console.log(fastify.printRoutes()));
		fastify.log.info('auth service is running on port 3000');
	} catch (err) {
		fastify.log.error(err);
		process.exit(1);
	}
}
