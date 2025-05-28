import { FastifyPluginAsync, FastifyReply , FastifyRequest } from 'fastify';

const verifyJWTToken = (token : string) => {
	const base64Url = token.split('.')[1];
	const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
	const jsonPayload = decodeURIComponent(
		atob(base64)
			.split('')
			.map((c) => {
				return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
			})
			.join('')
	);

	const data = JSON.parse(jsonPayload);
	return data;
}

const loginRoute: FastifyPluginAsync = async (fastify) => {
  fastify.post('/login', async (request: FastifyRequest<{ Body: { username: string } }>, reply: FastifyReply) => {
	try {
		const { username } = request.body;
		const data = verifyJWTToken(username);
		console.log(typeof data);
		if (data?.email_verified) {
			return reply.code(200).send({ email_verified : data.email_verified,
				given_name : data.given_name,
				picture : data.picture,
				email: data.email,
			})
		} else {
			return reply.code(401).send({ error: 'Email not verified' });
		}
	} catch (err) {
		console.error('Error during login:', err);
		return reply.code(500).send({ error: 'Internal Server Error' });
	}}
)};

export default loginRoute;
