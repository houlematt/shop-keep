'use strict';

const bcrypt = require('bcrypt');
const Jwt = require('jsonwebtoken');
const { User } = require('../models');
const { getJwtSecret } = require('../lib/jwt-config');
const { toPublicUser, rowPk } = require('./user.service');

async function login(pool, email, password) {
  const trimmed = String(email || '').trim();
  if (!trimmed || !password) {
    const err = new Error('email and password are required');
    err.code = 'VALIDATION';
    throw err;
  }
  const row = await User.findByEmail(pool, trimmed);
  if (!row || !row.is_active) {
    const err = new Error('Invalid email or password');
    err.code = 'AUTH_FAILED';
    throw err;
  }
  const ok = await bcrypt.compare(String(password), row.password_hash);
  if (!ok) {
    const err = new Error('Invalid email or password');
    err.code = 'AUTH_FAILED';
    throw err;
  }

  const user = toPublicUser(row);
  const secret = getJwtSecret();
  const token = Jwt.sign(
    { sub: String(rowPk(row)), role: user.role },
    secret,
    { expiresIn: '7d' }
  );
  return { token, user };
}

module.exports = {
  login
};
