import { FastifyInstance } from 'fastify';

export default async function matchRoutes(server: FastifyInstance) {
  server.get('/match', async (request, reply) => {
    return { message: 'match ok' };
  });
}
