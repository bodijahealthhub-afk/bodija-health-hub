'use strict';

const Database = require('better-sqlite3');
const path = require('path');
const rootDir = path.resolve(__dirname, '../..');

const dbPath = process.env.DB_PATH || path.join(__dirname, '..', 'database.sqlite');
const db = new Database(path.isAbsolute(dbPath) ? dbPath : path.join(rootDir, dbPath));

db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

const impl = {
  backend: 'sqlite',
  ready: Promise.resolve(),
  get: async (sql, params = []) => db.prepare(sql).get(...params),
  all: async (sql, params = []) => db.prepare(sql).all(...params),
  run: async (sql, params = []) => {
    const res = db.prepare(sql).run(...params);
    return { changes: res.changes, lastInsertRowid: res.lastInsertRowid };
  },
  exec: async (sql) => {
    db.exec(sql);
  },
  pragma: (p) => db.pragma(p),
  transaction: async (fn) => {
    db.prepare('BEGIN').run();
    try {
      const result = await fn();
      db.prepare('COMMIT').run();
      return result;
    } catch (err) {
      db.prepare('ROLLBACK').run();
      throw err;
    }
  },
  close: () => db.close(),
};

module.exports = impl;
