'use strict';

const TABLE = 'users';
const PK = process.env.USERS_PK_COLUMN || 'user_id';

const ROLES = Object.freeze(['SHOP', 'ADMIN', 'FIELD']);
const LIST_LIMIT = 5;
const ADMIN_MAX_LIMIT = 200;

const PUBLIC_SELECT = `${PK} AS id, email, first_name, last_name, role, is_active, created_at, updated_at`;

function assertRole(role) {
  if (role !== undefined && !ROLES.includes(role)) {
    throw new Error(`Invalid role: ${role}`);
  }
}

async function findById(pool, id) {
  const [rows] = await pool.query(`SELECT * FROM \`${TABLE}\` WHERE \`${PK}\` = ? LIMIT 1`, [id]);
  return rows[0] || null;
}

async function findByEmail(pool, email) {
  const [rows] = await pool.query(`SELECT * FROM \`${TABLE}\` WHERE email = ? LIMIT 1`, [email]);
  return rows[0] || null;
}

async function listRecent(pool) {
  const [rows] = await pool.query(
    `SELECT ${PUBLIC_SELECT} FROM \`${TABLE}\` ORDER BY \`${PK}\` ASC LIMIT ?`,
    [LIST_LIMIT]
  );
  return rows;
}

async function listPaged(pool, { limit = LIST_LIMIT, offset = 0 } = {}) {
  const lim = Math.min(Math.max(Number(limit) || LIST_LIMIT, 1), ADMIN_MAX_LIMIT);
  const off = Math.max(Number(offset) || 0, 0);
  const [rows] = await pool.query(
    `SELECT ${PUBLIC_SELECT} FROM \`${TABLE}\` ORDER BY \`${PK}\` ASC LIMIT ? OFFSET ?`,
    [lim, off]
  );
  return rows;
}

async function create(pool, input) {
  const role = input.role != null ? String(input.role).toUpperCase() : 'SHOP';
  assertRole(role);
  const isActive = input.is_active !== undefined ? input.is_active : 1;
  const [result] = await pool.query(
    `INSERT INTO \`${TABLE}\` (email, password_hash, first_name, last_name, role, is_active)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [
      input.email,
      input.password_hash,
      input.first_name ?? '',
      input.last_name ?? '',
      role,
      isActive ? 1 : 0
    ]
  );
  return { insertId: String(result.insertId) };
}

async function updateById(pool, id, patch) {
  const sets = [];
  const values = [];
  if (patch.email !== undefined) {
    sets.push('`email` = ?');
    values.push(patch.email);
  }
  if (patch.first_name !== undefined) {
    sets.push('`first_name` = ?');
    values.push(patch.first_name);
  }
  if (patch.last_name !== undefined) {
    sets.push('`last_name` = ?');
    values.push(patch.last_name);
  }
  if (patch.role !== undefined) {
    assertRole(patch.role);
    sets.push('`role` = ?');
    values.push(patch.role);
  }
  if (patch.is_active !== undefined) {
    sets.push('`is_active` = ?');
    values.push(patch.is_active ? 1 : 0);
  }
  if (patch.password_hash !== undefined) {
    sets.push('`password_hash` = ?');
    values.push(patch.password_hash);
  }
  if (sets.length === 0) {
    return { affectedRows: 0 };
  }
  values.push(id);
  const [result] = await pool.query(
    `UPDATE \`${TABLE}\` SET ${sets.join(', ')} WHERE \`${PK}\` = ?`,
    values
  );
  return { affectedRows: result.affectedRows };
}

async function deleteById(pool, id) {
  const [result] = await pool.query(`DELETE FROM \`${TABLE}\` WHERE \`${PK}\` = ? LIMIT 1`, [id]);
  return { affectedRows: result.affectedRows };
}

module.exports = {
  TABLE,
  PK,
  ROLES,
  LIST_LIMIT,
  ADMIN_MAX_LIMIT,
  findById,
  findByEmail,
  listRecent,
  listPaged,
  create,
  updateById,
  deleteById
};
