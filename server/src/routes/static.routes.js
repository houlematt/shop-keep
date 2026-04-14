'use strict';

const Fs = require('fs');
const Path = require('path');

function isPathInsideRoot(root, candidate) {
  const relative = Path.relative(root, candidate);
  return relative === '' || (!relative.startsWith('..') && !Path.isAbsolute(relative));
}

function register(server, { staticRoot }) {
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
}

module.exports = { register };
