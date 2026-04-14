'use strict';

const userService = require('../services/user.service');

const requireAdmin = {
  auth: {
    strategies: ['jwt'],
    scope: ['ADMIN']
  }
};

function mapServiceError(err, h) {
  if (err.code === 'EMAIL_TAKEN') {
    return h.response({ error: 'email_taken', message: err.message }).code(409);
  }
  if (err.code === 'VALIDATION') {
    return h.response({ error: 'validation', message: err.message }).code(400);
  }
  return null;
}

function register(server) {
  server.route({
    method: 'GET',
    path: '/api/users',
    options: { ...requireAdmin },
    handler: async (request, h) => {
      const pool = request.server.app.mysql;
      if (!pool) {
        return h
          .response({ error: 'database_unavailable', message: 'MySQL pool is not attached to the server' })
          .code(503);
      }
      try {
        const users = await userService.listUsers(pool, request.query);
        return h.response({ users }).type('application/json');
      } catch (err) {
        request.server.log(['error', 'users'], err);
        const message = err.sqlMessage || err.message || String(err);
        return h.response({ error: 'failed_to_load_users', message }).code(500);
      }
    }
  });

  server.route({
    method: 'GET',
    path: '/api/users/{id}',
    options: { ...requireAdmin },
    handler: async (request, h) => {
      const pool = request.server.app.mysql;
      if (!pool) {
        return h.response({ error: 'database_unavailable' }).code(503);
      }
      try {
        const user = await userService.getUserById(pool, request.params.id);
        if (!user) {
          return h.response({ error: 'not_found' }).code(404);
        }
        return h.response({ user }).type('application/json');
      } catch (err) {
        request.server.log(['error', 'users'], err);
        const message = err.sqlMessage || err.message || String(err);
        return h.response({ error: 'failed_to_load_user', message }).code(500);
      }
    }
  });

  server.route({
    method: 'POST',
    path: '/api/users',
    options: {
      ...requireAdmin,
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
        const user = await userService.createUser(pool, request.payload || {});
        return h.response({ user }).code(201).type('application/json');
      } catch (err) {
        const mapped = mapServiceError(err, h);
        if (mapped) return mapped;
        if (err.code === 'ER_DUP_ENTRY') {
          return h.response({ error: 'email_taken', message: 'Email already in use' }).code(409);
        }
        request.server.log(['error', 'users'], err);
        const message = err.sqlMessage || err.message || String(err);
        return h.response({ error: 'failed_to_create_user', message }).code(500);
      }
    }
  });

  server.route({
    method: 'PUT',
    path: '/api/users/{id}',
    options: {
      ...requireAdmin,
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
        const user = await userService.updateUser(pool, request.params.id, request.payload || {});
        if (!user) {
          return h.response({ error: 'not_found' }).code(404);
        }
        return h.response({ user }).type('application/json');
      } catch (err) {
        const mapped = mapServiceError(err, h);
        if (mapped) return mapped;
        if (err.code === 'ER_DUP_ENTRY') {
          return h.response({ error: 'email_taken', message: 'Email already in use' }).code(409);
        }
        request.server.log(['error', 'users'], err);
        const message = err.sqlMessage || err.message || String(err);
        return h.response({ error: 'failed_to_update_user', message }).code(500);
      }
    }
  });

  server.route({
    method: 'DELETE',
    path: '/api/users/{id}',
    options: { ...requireAdmin },
    handler: async (request, h) => {
      const pool = request.server.app.mysql;
      if (!pool) {
        return h.response({ error: 'database_unavailable' }).code(503);
      }
      try {
        const ok = await userService.deleteUser(pool, request.params.id);
        if (!ok) {
          return h.response({ error: 'not_found' }).code(404);
        }
        return h.response().code(204);
      } catch (err) {
        request.server.log(['error', 'users'], err);
        const message = err.sqlMessage || err.message || String(err);
        return h.response({ error: 'failed_to_delete_user', message }).code(500);
      }
    }
  });
}

module.exports = { register };
