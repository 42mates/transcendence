import { FastifyPluginAsync, FastifyRequest, FastifyReply } from 'fastify';
import Database from 'better-sqlite3';

const doesuserexistRoute: FastifyPluginAsync = async (fastify) => {
	fastify.post('/doesuserexist', async (request: FastifyRequest<{ Body: { username: string } }>, reply: FastifyReply) => {
		const { username } = request.body;
		if (!username) {
			reply.status(400).send({ error: 'Username is required' });
			return;
		}
		const result = await doesuserexist({ username });
		reply.send({ message: result });
	});
};

// Open the SQLite database
const db = new Database('/data/database.sqlite');

const doesuserexist = (body: { username: string }): boolean => {
	const { username } = body;

	// Query the database to check if the user exists
	const stmt = db.prepare('SELECT 1 FROM users WHERE username = ?');
	const user = stmt.get(username);
	return !!user;
};

export default doesuserexistRoute;
