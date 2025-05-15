import {FastifyPluginAsync, FastifyInstance, FastifyRequest, FastifyReply} from 'fastify';
import Database from 'better-sqlite3';

// Open the SQLite database
const db = new Database('/data/database.sqlite');

const gameRoute: FastifyPluginAsync = async (fastify) => {
	fastify.post('/game', async (request, reply) => {
		console.log('auth/game OK, sending response'); // Use Fastify's logger
		reply.send({message: 'api/auth/game route accessed successfully'});
	});
};

export default gameRoute;
