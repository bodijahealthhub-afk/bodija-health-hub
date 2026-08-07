'use strict';

const { Pool } = require('pg');
const { createImpl, splitStatements, translateSchema, runWithContext, getContext } = require('./pgCommon');

const url = process.env.DATABASE_URL;
if (!url) throw new Error('DATABASE_URL is required for the postgres backend');

const isLocal = /localhost|127\.0\.0\.1|0\.0\.0\.0/.test(url);
const pool = new Pool({
  connectionString: url,
  ssl: isLocal ? false : { rejectUnauthorized: false },
  family: Number(process.env.PG_FAMILY || 4),
});

const impl = {
  backend: 'postgres',
  ready: Promise.resolve(),
  async query(sql, params = []) {
    const ctx = getContext();
    if (ctx && ctx.client) {
      return ctx.client.query(sql, params);
    }
    return pool.query(sql, params);
  },
  async exec(sql) {
    for (const stmt of splitStatements(translateSchema(sql))) {
      await pool.query(stmt);
    }
  },
  pragma: () => undefined,
  async transaction(fn) {
    const client = await pool.connect();
    await client.query('BEGIN');
    try {
      const result = await runWithContext({ client }, fn);
      await client.query('COMMIT');
      return result;
    } catch (err) {
      try { await client.query('ROLLBACK'); } catch (e) { /* ignore */ }
      throw err;
    } finally {
      client.release();
    }
  },
  async close() {
    await pool.end();
  },
};

module.exports = createImpl(impl);
