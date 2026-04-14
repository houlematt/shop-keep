'use strict';

const Path = require('path');

require('dotenv').config({ path: Path.resolve(__dirname, '../../.env') });

const Hapi = require('@hapi/hapi');
const Inert = require('@hapi/inert');

const database = require('./lib/database');
const { registerAll } = require('./routes');

const staticRoot = Path.resolve(__dirname, '../../client/dist');

async function createServer() {
  await database.connect();

  const server = Hapi.server({
    port: Number(process.env.PORT) || 3000,
    host: process.env.HOST || '0.0.0.0',
    routes: {
      files: {
        relativeTo: staticRoot
      },
      cors: process.env.NODE_ENV === 'production'
        ? false
        : {
            origin: ['http://localhost:5173'],
            additionalHeaders: ['cache-control']
          }
    }
  });

  await server.register(Inert);
  registerAll(server, { staticRoot });

  server.app.mysql = database.pool;

  return server;
}

async function main() {
  const server = await createServer();
  await server.start();
  console.log(`Server running at ${server.info.uri}`);

  const stop = async (signal) => {
    console.log(`received ${signal}, shutting down`);
    await server.stop({ timeout: 10_000 });
    await database.shutdown().catch(() => {});
    process.exit(0);
  };

  process.once('SIGINT', () => stop('SIGINT'));
  process.once('SIGTERM', () => stop('SIGTERM'));
}

main().catch(async (err) => {
  console.error(err);
  await database.shutdown().catch(() => {});
  process.exit(1);
});
