import server from '../../src/server';

export default async () => {
  global.httpServer = await server.start({ port: 4000 });
};
