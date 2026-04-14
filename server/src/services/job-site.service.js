'use strict';

const { JobSite } = require('../models');

function emptyToNull(v) {
  if (v === undefined || v === null) return null;
  const s = String(v).trim();
  return s === '' ? null : s;
}

function numOrNull(v) {
  if (v === '' || v == null) return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

function normalizeIsActive(body) {
  if (body.is_active === undefined) return null;
  if (body.is_active === null) return null;
  if (body.is_active === true || body.is_active === 1 || body.is_active === '1') return 1;
  if (body.is_active === false || body.is_active === 0 || body.is_active === '0') return 0;
  return null;
}

function toPublic(row) {
  if (!row) return null;
  const rawId = row.id ?? row.job_site_id;
  const id =
    typeof rawId === 'bigint' ? rawId.toString() : rawId != null ? String(rawId) : rawId;
  return {
    id,
    name: row.name,
    code: row.code,
    address_line1: row.address_line1,
    address_line2: row.address_line2,
    city: row.city,
    state: row.state,
    postal_code: row.postal_code,
    country: row.country,
    latitude: row.latitude != null ? Number(row.latitude) : null,
    longitude: row.longitude != null ? Number(row.longitude) : null,
    customer_name: row.customer_name,
    phone: row.phone,
    notes: row.notes,
    status: row.status,
    is_active: row.is_active,
    created_at: row.created_at,
    updated_at: row.updated_at
  };
}

function rowPk(row) {
  if (!row) return null;
  return row.job_site_id ?? row.id;
}

function normalizeCreateBody(body) {
  const name = String(body.name || '').trim();
  if (!name) {
    const err = new Error('name is required');
    err.code = 'VALIDATION';
    throw err;
  }
  return {
    name,
    code: emptyToNull(body.code),
    address_line1: emptyToNull(body.address_line1),
    address_line2: emptyToNull(body.address_line2),
    city: emptyToNull(body.city),
    state: emptyToNull(body.state),
    postal_code: emptyToNull(body.postal_code),
    country: emptyToNull(body.country),
    latitude: numOrNull(body.latitude),
    longitude: numOrNull(body.longitude),
    customer_name: emptyToNull(body.customer_name),
    phone: emptyToNull(body.phone),
    notes: emptyToNull(body.notes),
    status: emptyToNull(body.status),
    is_active: normalizeIsActive(body)
  };
}

function normalizePatch(body) {
  const patch = {};
  if (body.name !== undefined) {
    const name = String(body.name).trim();
    if (!name) {
      const err = new Error('name cannot be empty');
      err.code = 'VALIDATION';
      throw err;
    }
    patch.name = name;
  }
  if (body.code !== undefined) patch.code = emptyToNull(body.code);
  if (body.address_line1 !== undefined) patch.address_line1 = emptyToNull(body.address_line1);
  if (body.address_line2 !== undefined) patch.address_line2 = emptyToNull(body.address_line2);
  if (body.city !== undefined) patch.city = emptyToNull(body.city);
  if (body.state !== undefined) patch.state = emptyToNull(body.state);
  if (body.postal_code !== undefined) patch.postal_code = emptyToNull(body.postal_code);
  if (body.country !== undefined) patch.country = emptyToNull(body.country);
  if (body.latitude !== undefined) patch.latitude = numOrNull(body.latitude);
  if (body.longitude !== undefined) patch.longitude = numOrNull(body.longitude);
  if (body.customer_name !== undefined) patch.customer_name = emptyToNull(body.customer_name);
  if (body.phone !== undefined) patch.phone = emptyToNull(body.phone);
  if (body.notes !== undefined) patch.notes = emptyToNull(body.notes);
  if (body.status !== undefined) patch.status = emptyToNull(body.status);
  if (body.is_active !== undefined) patch.is_active = normalizeIsActive({ is_active: body.is_active });
  return patch;
}

async function listJobSites(pool, query) {
  const limit = query.limit != null ? Number(query.limit) : JobSite.LIST_LIMIT;
  const offset = query.offset != null ? Number(query.offset) : 0;
  const rows = await JobSite.listPaged(pool, { limit, offset });
  return rows.map(toPublic);
}

async function getJobSiteById(pool, id) {
  const row = await JobSite.findById(pool, id);
  return toPublic(row);
}

async function createJobSite(pool, body) {
  const input = normalizeCreateBody(body);
  const { insertId } = await JobSite.create(pool, input);
  return getJobSiteById(pool, insertId);
}

async function updateJobSite(pool, id, body) {
  const row = await JobSite.findById(pool, id);
  if (!row) return null;
  const patch = normalizePatch(body);
  if (Object.keys(patch).length > 0) {
    await JobSite.updateById(pool, id, patch);
  }
  return getJobSiteById(pool, id);
}

async function deleteJobSite(pool, id) {
  const { affectedRows } = await JobSite.deleteById(pool, id);
  return affectedRows > 0;
}

module.exports = {
  toPublic,
  rowPk,
  listJobSites,
  getJobSiteById,
  createJobSite,
  updateJobSite,
  deleteJobSite
};
