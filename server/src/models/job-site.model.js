'use strict';

const TABLE = 'job_sites';
const PK = process.env.JOB_SITES_PK_COLUMN || 'job_site_id';

const LIST_LIMIT = 50;
const ADMIN_MAX_LIMIT = 500;

const PUBLIC_SELECT = [
  `${PK} AS id`,
  'name',
  'code',
  'address_line1',
  'address_line2',
  'city',
  'state',
  'postal_code',
  'country',
  'latitude',
  'longitude',
  'customer_name',
  'phone',
  'notes',
  'status',
  'is_active',
  'created_at',
  'updated_at'
].join(', ');

function normalizeIsActiveDb(v) {
  if (v === undefined || v === null) return null;
  if (v === true || v === 1 || v === '1') return 1;
  if (v === false || v === 0 || v === '0') return 0;
  return null;
}

async function findById(pool, id) {
  const [rows] = await pool.query(`SELECT * FROM \`${TABLE}\` WHERE \`${PK}\` = ? LIMIT 1`, [id]);
  return rows[0] || null;
}

async function listPaged(pool, { limit = LIST_LIMIT, offset = 0 } = {}) {
  const lim = Math.min(Math.max(Number(limit) || LIST_LIMIT, 1), ADMIN_MAX_LIMIT);
  const off = Math.max(Number(offset) || 0, 0);
  const [rows] = await pool.query(
    `SELECT ${PUBLIC_SELECT} FROM \`${TABLE}\` ORDER BY \`${PK}\` DESC LIMIT ? OFFSET ?`,
    [lim, off]
  );
  return rows;
}

async function create(pool, input) {
  const [result] = await pool.query(
    `INSERT INTO \`${TABLE}\` (
      name, code, address_line1, address_line2, city, state, postal_code, country,
      latitude, longitude, customer_name, phone, notes, status, is_active
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      input.name,
      input.code,
      input.address_line1,
      input.address_line2,
      input.city,
      input.state,
      input.postal_code,
      input.country,
      input.latitude,
      input.longitude,
      input.customer_name,
      input.phone,
      input.notes,
      input.status,
      normalizeIsActiveDb(input.is_active)
    ]
  );
  return { insertId: String(result.insertId) };
}

async function updateById(pool, id, patch) {
  const sets = [];
  const values = [];
  const cols = [
    'name',
    'code',
    'address_line1',
    'address_line2',
    'city',
    'state',
    'postal_code',
    'country',
    'latitude',
    'longitude',
    'customer_name',
    'phone',
    'notes',
    'status',
    'is_active'
  ];
  for (const col of cols) {
    if (patch[col] !== undefined) {
      sets.push(`\`${col}\` = ?`);
      if (col === 'is_active') {
        values.push(normalizeIsActiveDb(patch[col]));
      } else {
        values.push(patch[col]);
      }
    }
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
  LIST_LIMIT,
  ADMIN_MAX_LIMIT,
  findById,
  listPaged,
  create,
  updateById,
  deleteById
};
