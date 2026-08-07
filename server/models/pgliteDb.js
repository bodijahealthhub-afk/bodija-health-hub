'use strict';

const { createImpl, translateSchema, splitStatements, runWithContext, getContext } = require('./pgCommon');

let PGlite;
try {
  ({ PGlite } = require('@electric-sql/pglite'));
} catch (err) {
  throw new Error('DB_BACKEND=pglite requires @electric-sql/pglite (dev dependency) to be installed');
}

let instancePromise = null;
function getInstance() {
  if (!instancePromise) {
    instancePromise = (PGlite.create ? PGlite.create() : Promise.resolve(new PGlite())).catch((err) => {
      instancePromise = null;
      throw err;
    });
  }
  return instancePromise;
}

const impl = {
  backend: 'pglite',
  ready: getInstance().then(() => undefined),
  async query(sql, params = []) {
    const pg = await getInstance();
    const ctx = getContext();
    const exec = ctx && ctx.tx ? ctx.tx : pg;
    const result = await exec.query(sql, params);
    return {
      rows: result.rows || [],
      rowCount: result.affectedRows != null ? result.affectedRows : (result.rows || []).length,
    };
  },
  async exec(sql) {
    const pg = await getInstance();
    const statements = splitStatements(translateSchema(sql));
    for (const stmt of statements) {
      await pg.exec(stmt);
    }
  },
  pragma: () => undefined,
  async transaction(fn) {
    const pg = await getInstance();
    await pg.exec('BEGIN');
    try {
      const result = await runWithContext({ tx: pg }, fn);
      await pg.exec('COMMIT');
      return result;
    } catch (err) {
      try { await pg.exec('ROLLBACK'); } catch (e) { /* ignore */ }
      throw err;
    }
  },
  async close() {
    const pg = await getInstance();
    await pg.close();
    instancePromise = null;
  },
};

module.exports = createImpl(impl);
