import { FastifyInstance } from 'fastify';

export default async function loginRoutes(server: FastifyInstance) {
  server.get('/login', async (request, reply) => {
    return { message: 'login ok' };
  });
}
