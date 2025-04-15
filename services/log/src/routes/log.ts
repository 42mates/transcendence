import { FastifyPluginAsync } from 'fastify';

const logRoute: FastifyPluginAsync = async (fastify) => {
	console.log('Registering log route');
	fastify.post('/', async (request, reply) => {
		const logs = request.body;
		console.log('Logs received:', logs); // Print logs to stdout
		reply.send({ message: 'Logs received', logs });
	});
};

export default logRoute;
