'use strict';

const mysql = require('mysql2/promise');

const host = process.env.MYSQL_HOST || process.env.DATABASE_HOST;
const port = Number(process.env.MYSQL_PORT) || 3306;

const pool = mysql.createPool({
  host: host || '127.0.0.1',
  port,
  user: process.env.MYSQL_USER,
  password: process.env.MYSQL_PASSWORD,
  database: process.env.MYSQL_DATABASE,
  waitForConnections: true,
  connectionLimit: Number(process.env.MYSQL_CONNECTION_LIMIT) || 10,
  queueLimit: 0,
  multipleStatements: true
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
