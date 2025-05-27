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

	const data = JSON.parse(jsonPayload);
	return data;
}

const loginRoute: FastifyPluginAsync = async (fastify) => {
  fastify.post('/login', async (request: FastifyRequest<{ Body: { username: string } }>, reply: FastifyReply) => {
    const { username } = request.body;
    const data = verifyJWTToken(username);
    if(data.email_verified)
    {
      return reply.send({email_verified : data.email_verified});
    }
    else
      return reply.send({"message": "error"});
  }
)};

export default loginRoute;
