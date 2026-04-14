'use strict';

const userService = require('../services/user.service');

function register(server) {
  server.route({
    method: 'GET',
    path: '/api/users',
    handler: async (request, h) => {
      const pool = request.server.app.mysql;
      if (!pool) {
        return h
          .response({ error: 'database_unavailable', message: 'MySQL pool is not attached to the server' })
          .code(503);
      }
      try {
        const users = await userService.listUsersPreview(pool);
        return h.response({ users }).type('application/json');
      } catch (err) {
        request.server.log(['error', 'users'], err);
        const message = err.sqlMessage || err.message || String(err);
        return h
          .response({
            error: 'failed_to_load_users',
            message
          })
          .code(500);
      }
    }
  });
}

module.exports = { register };
