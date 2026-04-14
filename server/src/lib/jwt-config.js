'use strict';

function getJwtSecret() {
  const s = process.env.JWT_SECRET;
  if (s && String(s).length > 0) return String(s);
  if (process.env.NODE_ENV === 'production') {
    throw new Error('JWT_SECRET must be set in production');
  }
  return 'dev-insecure-jwt-secret-change-me';
}

module.exports = {
  getJwtSecret
};
