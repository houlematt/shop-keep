'use strict';

const userService = require('../services/user.service');

function register(server) {
  server.route({
    method: 'GET',
    path: '/api/users',
    handler: async (request, h) => {
      const pool = request.server.app.mysql;
      try {
        const users = await userService.listUsersPreview(pool);
        return h.response({ users }).type('application/json');
      } catch (err) {
        request.server.log(['error', 'users'], err);
        return h.response({ error: 'failed_to_load_users' }).code(500);
      }
    }
  });
}

module.exports = { register };
