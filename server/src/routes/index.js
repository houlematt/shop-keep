'use strict';

const { registerJwtStrategy } = require('../auth/register-strategy');
const healthRoutes = require('./health.routes');
const authRoutes = require('./auth.routes');
const usersRoutes = require('./users.routes');
const jobSitesRoutes = require('./job-sites.routes');
const staticRoutes = require('./static.routes');

function registerAll(server, options) {
  registerJwtStrategy(server);
  healthRoutes.register(server);
  authRoutes.register(server);
  usersRoutes.register(server);
  jobSitesRoutes.register(server);
  staticRoutes.register(server, options);
}

module.exports = {
  registerAll
};
