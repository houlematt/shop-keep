'use strict';

const Path = require('path');

require('dotenv').config({ path: Path.resolve(__dirname, '../../.env') });

const Hapi = require('@hapi/hapi');
const Inert = require('@hapi/inert');

const database = require('./lib/database');
const { registerAll } = require('./routes');

const staticRoot = Path.resolve(__dirname, '../../client/dist');

function attachLogging(server) {
  const logEachRequest =
    process.env.NODE_ENV !== 'production' || process.env.LOG_REQUESTS === 'true';

  server.events.on('response', (request) => {
    if (!logEachRequest) return;
    const res = request.response;
    const status = res && typeof res.statusCode === 'number' ? res.statusCode : 0;
    const ms = request.info.responded - request.info.received;
    console.log(`${request.method.toUpperCase()} ${request.path} ${status} ${ms}ms`);
  });

  server.events.on('log', (event, tags) => {
    if (tags.error) {
      console.error('[hapi:error]', event.error || event.data);
    }
  });
}

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
            additionalHeaders: ['cache-control', 'authorization'],
            exposedHeaders: ['authorization']
          }
    }
  });

  server.app.mysql = database.pool;

  await server.register(Inert);
  registerAll(server, { staticRoot });

  attachLogging(server);

  return server;
}

async function main() {
  const server = await createServer();
  await server.start();
  const env = process.env.NODE_ENV || 'development';
  console.log(`Server running at ${server.info.uri} (NODE_ENV=${env})`);

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
