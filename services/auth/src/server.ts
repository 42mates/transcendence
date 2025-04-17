import Fastify from 'fastify';
import loginRoute from './routes/login';
import doesuserexistRoute from './routes/doesuserexist';

export default async function startServer() {
	const fastify = Fastify(); // JSON logging enabled by default
	//const fastify = Fastify({logger:true}); // JSON logging enabled by default

	fastify.register(loginRoute);
	fastify.register(doesuserexistRoute);

	try {
		await fastify.listen({ port: 3000, host: '0.0.0.0' });
		fastify.log.info('auth service is running on port 3000');
	} catch (err) {
		fastify.log.error(err);
		process.exit(1);
	}
}
