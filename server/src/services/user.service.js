'use strict';

const { User } = require('../models');

function toJsonSafeUser(row) {
  const id = row.id;
  return {
    ...row,
    id: typeof id === 'bigint' ? id.toString() : id != null ? String(id) : id
  };
}

async function listUsersPreview(pool) {
  const rows = await User.listRecent(pool);
  return rows.map(toJsonSafeUser);
}

module.exports = {
  listUsersPreview
};
