'use strict';

const { AsyncLocalStorage } = require('node:async_hooks');

const als = new AsyncLocalStorage();

const NUMERIC_KEYS = ['count', 'total', 'changes', 'size'];

const coerceRow = (row) => {
  if (row && typeof row === 'object') {
    for (const key of NUMERIC_KEYS) {
      const v = row[key];
      if (v !== undefined && typeof v === 'string' && /^-?\d+$/.test(v)) {
        row[key] = Number(v);
      }
    }
  }
  return row;
};

const translate = (sql) => {
  const orReplace = /^\s*INSERT\s+OR\s+REPLACE\s+INTO\s+([^\s(]+)\s*\(([^)]*)\)\s*VALUES/i.exec(sql);
  if (orReplace) {
    const table = orReplace[1];
    const cols = orReplace[2].split(',').map((c) => c.trim()).filter(Boolean);
    const params = cols.map((_, i) => `$${i + 1}`);
    const set = cols.map((c) => `${c} = EXCLUDED.${c}`).join(', ');
    return `INSERT INTO ${table} (${cols.join(', ')}) VALUES (${params.join(', ')}) ON CONFLICT (id) DO UPDATE SET ${set}`;
  }

  const orIgnore = /^\s*INSERT\s+OR\s+IGNORE\s+INTO\s+/i.test(sql);
  let i = 0;
  let s = sql.replace(/\?/g, () => `$${++i}`);
  s = s.replace(/^\s*INSERT\s+OR\s+IGNORE\s+INTO\s+/i, 'INSERT INTO ');

  const isInsert = /^\s*INSERT\s+/i.test(s);
  const alreadyConflict = /ON\s+CONFLICT/i.test(s);
  const hasReturning = /RETURNING/i.test(s);

  if (isInsert && orIgnore && !alreadyConflict) {
    s = s.replace(/(VALUES\s*\([^)]*\))/i, '$1 ON CONFLICT DO NOTHING');
  }
  if (isInsert && !hasReturning) {
    s += ' RETURNING id';
  }
  return s;
};

const translateSchema = (sql) =>
  sql
    .replace(/AUTOINCREMENT/g, '')
    .replace(/\bINTEGER\s+PRIMARY\s+KEY\b/gi, 'SERIAL PRIMARY KEY')
    .replace(/\bDATETIME\b/g, 'TIMESTAMP');

const splitStatements = (sql) =>
  sql
    .split(';')
    .map((s) => s.trim())
    .filter(Boolean);

const runWithContext = (context, fn) => als.run(context, fn);

const getContext = () => als.getStore();

const createImpl = ({ backend, ready, query, exec, pragma, transaction, close }) => ({
  backend,
  ready,
  get: async (sql, params = []) => {
    const res = await query(translate(sql), params);
    return coerceRow(res.rows[0]);
  },
  all: async (sql, params = []) => {
    const res = await query(translate(sql), params);
    return res.rows.map(coerceRow);
  },
  run: async (sql, params = []) => {
    const res = await query(translate(sql), params);
    return {
      changes: res.rowCount == null ? (res.rows ? res.rows.length : 0) : res.rowCount,
      lastInsertRowid: res.rows && res.rows[0] && res.rows[0].id != null ? Number(res.rows[0].id) : null,
    };
  },
  exec,
  pragma,
  transaction,
  close,
  als,
});

module.exports = { createImpl, translate, translateSchema, splitStatements, runWithContext, getContext, coerceRow };
