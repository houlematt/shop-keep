'use strict';

const bcrypt = require('bcrypt');
const { User } = require('../models');

function normalizeRole(role) {
  const raw = String(role ?? '').trim();
  const upper = raw.toUpperCase();
  if (User.ROLES.includes(upper)) return upper;
  if (raw.toLowerCase() === 'admin') return 'ADMIN';
  if (raw.toLowerCase() === 'user') return 'SHOP';
  return 'SHOP';
}

function toPublicUser(row) {
  if (!row) return null;
  const rawId = row.id ?? row.user_id;
  const id =
    typeof rawId === 'bigint' ? rawId.toString() : rawId != null ? String(rawId) : rawId;
  return {
    id,
    email: row.email,
    first_name: row.first_name,
    last_name: row.last_name,
    role: normalizeRole(row.role),
    is_active: row.is_active,
    created_at: row.created_at,
    updated_at: row.updated_at
  };
}

function rowPk(row) {
  if (!row) return null;
  return row.user_id;
}

async function listUsersPreview(pool) {
  const rows = await User.listRecent(pool);
  return rows.map(toPublicUser);
}

async function listUsers(pool, query) {
  const limit = query.limit != null ? Number(query.limit) : User.LIST_LIMIT;
  const offset = query.offset != null ? Number(query.offset) : 0;
  const rows = await User.listPaged(pool, { limit, offset });
  return rows.map(toPublicUser);
}

async function getUserById(pool, id) {
  const row = await User.findById(pool, id);
  return toPublicUser(row);
}

async function createUser(pool, body) {
  const email = String(body.email || '').trim();
  const password = body.password;
  if (!email || !password) {
    const err = new Error('email and password are required');
    err.code = 'VALIDATION';
    throw err;
  }
  const existing = await User.findByEmail(pool, email);
  if (existing) {
    const err = new Error('Email already in use');
    err.code = 'EMAIL_TAKEN';
    throw err;
  }
  const password_hash = await bcrypt.hash(String(password), 10);
  const role = normalizeRole(body.role ?? 'SHOP');
  const { insertId } = await User.create(pool, {
    email,
    password_hash,
    first_name: body.first_name,
    last_name: body.last_name,
    role,
    is_active: body.is_active
  });
  return getUserById(pool, insertId);
}

async function updateUser(pool, id, body) {
  const row = await User.findById(pool, id);
  if (!row) return null;

  const patch = {};
  if (body.email !== undefined) {
    const email = String(body.email).trim();
    if (!email) {
      const err = new Error('email cannot be empty');
      err.code = 'VALIDATION';
      throw err;
    }
    if (email !== row.email) {
      const existing = await User.findByEmail(pool, email);
      const existingPk = rowPk(existing);
      if (existing && String(existingPk) !== String(rowPk(row))) {
        const err = new Error('Email already in use');
        err.code = 'EMAIL_TAKEN';
        throw err;
      }
    }
    patch.email = email;
  }
  if (body.first_name !== undefined) patch.first_name = body.first_name;
  if (body.last_name !== undefined) patch.last_name = body.last_name;
  if (body.role !== undefined) patch.role = normalizeRole(body.role);
  if (body.is_active !== undefined) patch.is_active = body.is_active ? 1 : 0;
  if (body.password != null && String(body.password).length > 0) {
    patch.password_hash = await bcrypt.hash(String(body.password), 10);
  }

  if (Object.keys(patch).length > 0) {
    await User.updateById(pool, id, patch);
  }
  return getUserById(pool, id);
}

async function deleteUser(pool, id) {
  const { affectedRows } = await User.deleteById(pool, id);
  return affectedRows > 0;
}

module.exports = {
  normalizeRole,
  toPublicUser,
  rowPk,
  listUsersPreview,
  listUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser
};
