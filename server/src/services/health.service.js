'use strict';

function getHealth() {
  return { ok: true, service: 'shop-keep' };
}

module.exports = {
  getHealth
};
