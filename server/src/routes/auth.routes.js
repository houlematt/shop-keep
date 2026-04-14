'use strict';

const authService = require('../services/auth.service');

function register(server) {
  server.route({
    method: 'POST',
    path: '/api/auth/login',
    options: {
      auth: false,
      payload: {
        parse: true,
        allow: 'application/json'
      }
    },
    handler: async (request, h) => {
      const pool = request.server.app.mysql;
      if (!pool) {
        return h.response({ error: 'database_unavailable' }).code(503);
      }
      try {
        const result = await authService.login(
          pool,
          request.payload?.email,
          request.payload?.password
        );
        return h.response(result).type('application/json');
      } catch (err) {
        if (err.code === 'VALIDATION') {
          return h.response({ error: 'validation', message: err.message }).code(400);
        }
        if (err.code === 'AUTH_FAILED') {
          return h.response({ error: 'unauthorized', message: err.message }).code(401);
        }
        request.server.log(['error', 'auth'], err);
        return h.response({ error: 'login_failed', message: err.message }).code(500);
      }
    }
  });
}

module.exports = { register };
