import { FastifyPluginAsync, FastifyReply , FastifyRequest } from 'fastify';

// 
// const verifyToken = (token:string)


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

	const decoded = JSON.parse(jsonPayload);
	// saveToLocalStorage(decoded);

	return decoded.email;
}

const loginRoute: FastifyPluginAsync = async (fastify) => {
  console.log("hello_o ");
  fastify.post('/login', async (request: FastifyRequest<{ Body: { username: string } }>, reply: FastifyReply) => {
    console.log("coucou");
    const { username } = request.body;
    console.log(username);
    reply.send({ message: 'api/auth/login route accessed successfully' });

  });
};

export default loginRoute;
