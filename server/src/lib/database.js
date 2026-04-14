'use strict';

const mysql = require('mysql2/promise');

const host = process.env.MYSQLHOST;
const port = Number(process.env.MYSQLPORT) || 3306;

const useSsl =
  process.env.MYSQL_SSL === '1' ||
  process.env.MYSQL_SSL === 'true' ||
  process.env.MYSQL_SSL === 'yes';

const pool = mysql.createPool({
  host: host || '127.0.0.1',
  port,
  user: process.env.MYSQLUSER,
  password: process.env.MYSQLPASSWORD,
  database: process.env.MYSQL_DATABASE,
  waitForConnections: true,
  connectionLimit: Number(process.env.MYSQL_CONNECTION_LIMIT) || 10,
  queueLimit: 0,
  multipleStatements: true,
  ...(useSsl ? { ssl: { rejectUnauthorized: false } } : {})
});

async function connect() {
  console.info('connecting to mysql instance HOST: ' + (host || '127.0.0.1'));
  await pool.query('SELECT 1');
  return pool;
}

async function shutdown() {
  await pool.end();
}

module.exports = {
  pool,
  connect,
  shutdown
};
