'use strict';

const Fs = require('fs');
const Path = require('path');
const Hapi = require('@hapi/hapi');
const Inert = require('@hapi/inert');

const staticRoot = Path.resolve(__dirname, '../../client/dist');

function isPathInsideRoot(root, candidate) {
  const relative = Path.relative(root, candidate);
  return relative === '' || (!relative.startsWith('..') && !Path.isAbsolute(relative));
}

async function createServer() {
  const server = Hapi.server({
    port: Number(process.env.PORT) || 3900,
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

  server.route({
    method: 'GET',
    path: '/api/health',
    handler: () => ({ ok: true, service: 'shop-keep' })
  });

  const distExists = Fs.existsSync(staticRoot);

  if (distExists) {
    server.route({
      method: 'GET',
      path: '/{path*}',
      handler: (request, h) => {
        const segments = request.params.path || '';
        const candidate = Path.resolve(staticRoot, segments);

        if (!isPathInsideRoot(staticRoot, candidate)) {
          return h.file('index.html');
        }

        if (segments && Fs.existsSync(candidate) && Fs.statSync(candidate).isFile()) {
          return h.file(Path.relative(staticRoot, candidate));
        }

        return h.file('index.html');
      }
    });
  } else if (process.env.NODE_ENV === 'production') {
    server.route({
      method: 'GET',
      path: '/{any*}',
      handler: () => ({
        message: 'Client build not found. Run `npm run build` from the repo root.'
      })
    });
  }

  return server;
}

async function main() {
  const server = await createServer();
  await server.start();
  console.log(`Server running at ${server.info.uri}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
