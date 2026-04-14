'use strict';

const jobSiteService = require('../services/job-site.service');

function mapValidation(err, h) {
  if (err.code === 'VALIDATION') {
    return h.response({ error: 'validation', message: err.message }).code(400);
  }
  return null;
}

function register(server) {
  server.route({
    method: 'GET',
    path: '/api/job-sites',
    options: { auth: false },
    handler: async (request, h) => {
      const pool = request.server.app.mysql;
      if (!pool) {
        return h
          .response({ error: 'database_unavailable', message: 'MySQL pool is not attached' })
          .code(503);
      }
      try {
        const jobSites = await jobSiteService.listJobSites(pool, request.query);
        return h.response({ jobSites }).type('application/json');
      } catch (err) {
        request.server.log(['error', 'job-sites'], err);
        const message = err.sqlMessage || err.message || String(err);
        return h.response({ error: 'failed_to_load_job_sites', message }).code(500);
      }
    }
  });

  server.route({
    method: 'GET',
    path: '/api/job-sites/{id}',
    options: { auth: false },
    handler: async (request, h) => {
      const pool = request.server.app.mysql;
      if (!pool) return h.response({ error: 'database_unavailable' }).code(503);
      try {
        const jobSite = await jobSiteService.getJobSiteById(pool, request.params.id);
        if (!jobSite) return h.response({ error: 'not_found' }).code(404);
        return h.response({ jobSite }).type('application/json');
      } catch (err) {
        request.server.log(['error', 'job-sites'], err);
        const message = err.sqlMessage || err.message || String(err);
        return h.response({ error: 'failed_to_load_job_site', message }).code(500);
      }
    }
  });

  server.route({
    method: 'POST',
    path: '/api/job-sites',
    options: {
      auth: false,
      payload: { parse: true, allow: 'application/json' }
    },
    handler: async (request, h) => {
      const pool = request.server.app.mysql;
      if (!pool) return h.response({ error: 'database_unavailable' }).code(503);
      try {
        const jobSite = await jobSiteService.createJobSite(pool, request.payload || {});
        return h.response({ jobSite }).code(201).type('application/json');
      } catch (err) {
        const mapped = mapValidation(err, h);
        if (mapped) return mapped;
        request.server.log(['error', 'job-sites'], err);
        const message = err.sqlMessage || err.message || String(err);
        return h.response({ error: 'failed_to_create_job_site', message }).code(500);
      }
    }
  });

  server.route({
    method: 'PUT',
    path: '/api/job-sites/{id}',
    options: {
      auth: false,
      payload: { parse: true, allow: 'application/json' }
    },
    handler: async (request, h) => {
      const pool = request.server.app.mysql;
      if (!pool) return h.response({ error: 'database_unavailable' }).code(503);
      try {
        const jobSite = await jobSiteService.updateJobSite(pool, request.params.id, request.payload || {});
        if (!jobSite) return h.response({ error: 'not_found' }).code(404);
        return h.response({ jobSite }).type('application/json');
      } catch (err) {
        const mapped = mapValidation(err, h);
        if (mapped) return mapped;
        request.server.log(['error', 'job-sites'], err);
        const message = err.sqlMessage || err.message || String(err);
        return h.response({ error: 'failed_to_update_job_site', message }).code(500);
      }
    }
  });

  server.route({
    method: 'DELETE',
    path: '/api/job-sites/{id}',
    options: { auth: false },
    handler: async (request, h) => {
      const pool = request.server.app.mysql;
      if (!pool) return h.response({ error: 'database_unavailable' }).code(503);
      try {
        const ok = await jobSiteService.deleteJobSite(pool, request.params.id);
        if (!ok) return h.response({ error: 'not_found' }).code(404);
        return h.response().code(204);
      } catch (err) {
        request.server.log(['error', 'job-sites'], err);
        const message = err.sqlMessage || err.message || String(err);
        return h.response({ error: 'failed_to_delete_job_site', message }).code(500);
      }
    }
  });
}

module.exports = { register };
