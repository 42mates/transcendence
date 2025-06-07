import { FastifyPluginAsync, FastifyRequest, FastifyReply, FastifyInstance } from 'fastify';
import join from "../join/join";
import { JoinRequest } from "../types/messages";

let i = 0;
const joinRoute: FastifyPluginAsync = async (fastify: FastifyInstance) => 
{
	//! if needed, implement gameId to join a specific game.
	//fastify.get('/join', async (request: FastifyRequest<{ Querystring: { alias?: string; mode?: string; gameId?: string | null } }>, reply: FastifyReply) => {
	fastify.get('/join', async (request: FastifyRequest<{ Querystring: { alias?: string; mode?: string } }>, reply: FastifyReply) => {
		console.log("Join request received:", request.body);
		let message = request.body as JoinRequest;
		//const { alias, mode, gameId } = request.query;
		const { alias, mode } = request.query;
		if (!(mode === "1v1" || mode === "tournament" || mode === "local"))
			reply.status(400).send({ error: "Invalid mode" });
		if (!message)
		{
			message = {
				type: "join_request",
				payload: {
					alias: [alias ?? "http_player" + i++],
					mode: (mode === "1v1" || mode === "tournament" || mode === "local") ? mode : "1v1",
					//gameId: gameId ?? null
					gameId: null
				}
			};
		}
		else if (message.type !== "join_request" ||
			typeof message.payload !== "object" ||
			typeof message.payload.alias !== "string" ||
			!["1v1", "tournament", "local"].includes(message.payload.mode) ||
			!("gameId" in message.payload) ||
			(message.payload.gameId !== null && typeof message.payload.gameId !== "string"))
		{
			reply.status(400).send({ error: "Invalid join request" });
			return;
		}
		join(message, reply);
		return;
	});
};

export default joinRoute;