const db = require('../models/database');

const parseConfig = (raw) => {
  if (!raw) return {};
  if (typeof raw === 'object') return raw;
  try {
    return JSON.parse(raw);
  } catch {
    return {};
  }
};

const toFlag = (row) => {
  if (!row) return null;
  return {
    ...row,
    enabled: Boolean(row.enabled),
    public_visible: Boolean(row.public_visible),
    navigation_visible: Boolean(row.navigation_visible),
    admin_visible: Boolean(row.admin_visible),
    requires_admin_confirmation: Boolean(row.requires_admin_confirmation),
    config: parseConfig(row.config),
  };
};

const getAllFlags = async () => {
  const rows = await db.prepare('SELECT * FROM feature_flags ORDER BY name ASC').all();
  return rows.map(toFlag);
};

const getFlag = async (key) => {
  const row = await db.prepare('SELECT * FROM feature_flags WHERE key = ?').get(key);
  return toFlag(row);
};

const isEnabled = async (key) => {
  const row = await db.prepare('SELECT enabled FROM feature_flags WHERE key = ?').get(key);
  return Boolean(row && row.enabled);
};

module.exports = { getAllFlags, getFlag, isEnabled, parseConfig, toFlag };
