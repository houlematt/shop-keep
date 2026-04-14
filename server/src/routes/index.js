'use strict';

const healthRoutes = require('./health.routes');
const usersRoutes = require('./users.routes');
const staticRoutes = require('./static.routes');

function registerAll(server, options) {
  healthRoutes.register(server);
  usersRoutes.register(server);
  staticRoutes.register(server, options);
}

module.exports = {
  registerAll
};
