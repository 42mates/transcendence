import 'fastify';
import { IncomingMessage } from 'http';
import { ServerResponse } from 'http';

declare module 'fastify' {
  interface RouteShorthandOptions<
    RawServer = any,
    RawRequest = IncomingMessage,
    RawReply = ServerResponse
  > {
    websocket?: boolean;
  }

  interface FastifyInstance {
    websocketServer: import('ws').Server;
  }
}

declare module '@fastify/websocket';
