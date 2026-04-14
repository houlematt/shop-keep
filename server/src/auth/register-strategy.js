'use strict';

const Boom = require('@hapi/boom');
const Jwt = require('jsonwebtoken');
const { getJwtSecret } = require('../lib/jwt-config');

function registerJwtStrategy(server) {
  const secret = getJwtSecret();

  server.auth.scheme('jwt', () => ({
    authenticate: async (request, h) => {
      const header = request.headers.authorization;
      if (!header || !header.startsWith('Bearer ')) {
        throw Boom.unauthorized('Missing bearer token');
      }
      const token = header.slice(7).trim();
      if (!token) {
        throw Boom.unauthorized('Missing bearer token');
      }
      try {
        const decoded = Jwt.verify(token, secret);
        const role = decoded.role;
        const sub = decoded.sub;
        if (!sub || !role) {
          throw Boom.unauthorized('Invalid token payload');
        }
        return h.authenticated({
          credentials: {
            userId: String(sub),
            role: String(role),
            scope: [String(role)]
          }
        });
      } catch {
        throw Boom.unauthorized('Invalid or expired token');
      }
    }
  }));

  server.auth.strategy('jwt', 'jwt');
}

module.exports = {
  registerJwtStrategy
};
