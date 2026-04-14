'use strict';

const TABLE = 'users';

const ROLES = Object.freeze(['admin', 'user']);

/**
 * @typedef {'admin' | 'user'} UserRole
 */

/**
 * @typedef {Object} UserRow
 * @property {string} user_id
 * @property {string} email
 * @property {string} password_hash
 * @property {string} first_name
 * @property {string} last_name
 * @property {UserRole} role
 * @property {number} is_active
 * @property {Date} created_at
 * @property {Date} updated_at
 */

function assertRole(role) {
  if (!ROLES.includes(role)) {
    throw new Error(`Invalid role: ${role}`);
  }
}

/**
 * @param {import('mysql2/promise').Pool} pool
 * @param {string | number | bigint} id
 * @returns {Promise<UserRow | null>}
 */
async function findById(pool, id) {
  const [rows] = await pool.query(`SELECT * FROM \`${TABLE}\` WHERE id = ? LIMIT 1`, [id]);
  const row = rows[0];
  return row || null;
}

/**
 * @param {import('mysql2/promise').Pool} pool
 * @param {string} email
 * @returns {Promise<UserRow | null>}
 */
async function findByEmail(pool, email) {
  const [rows] = await pool.query(
    `SELECT * FROM \`${TABLE}\` WHERE email = ? LIMIT 1`,
    [email]
  );
  const row = rows[0];
  return row || null;
}

/**
 * @param {import('mysql2/promise').Pool} pool
 * @param {{
 *   email: string,
 *   password_hash: string,
 *   first_name?: string,
 *   last_name?: string,
 *   role?: UserRole,
 *   is_active?: number
 * }} input
 * @returns {Promise<{ insertId: string }>}
 */
const PUBLIC_LIST_COLUMNS = [
  'user_id',
  'email',
  'first_name',
  'last_name',
  'role',
  'is_active',
  'created_at',
  'updated_at'
].join(', ');

const LIST_LIMIT = 5;

/**
 * @param {import('mysql2/promise').Pool} pool
 * @returns {Promise<Omit<UserRow, 'password_hash'>[]>}
 */
async function listRecent(pool) {
  const [rows] = await pool.query(
    `SELECT ${PUBLIC_LIST_COLUMNS} FROM \`${TABLE}\` ORDER BY user_id ASC LIMIT ?`,
    [LIST_LIMIT]
  );
  return rows;
}

async function create(pool, input) {
  const role = input.role ?? 'user';
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

module.exports = {
  TABLE,
  ROLES,
  LIST_LIMIT,
  findById,
  findByEmail,
  listRecent,
  create
};
