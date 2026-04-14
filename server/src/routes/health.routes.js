'use strict';

const healthService = require('../services/health.service');

function register(server) {
  server.route({
    method: 'GET',
    path: '/api/health',
    handler: () => healthService.getHealth()
  });
}

module.exports = { register };
