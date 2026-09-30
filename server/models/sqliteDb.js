'use strict';

const Database = require('better-sqlite3');
const fs = require('fs');
const path = require('path');
const rootDir = path.resolve(__dirname, '../..');

const dbPath = process.env.DB_PATH || path.join(__dirname, '..', 'database.sqlite');
let resolved = path.isAbsolute(dbPath) ? dbPath : path.join(rootDir, dbPath);
try {
  // DB_PATH may point at a mount (e.g. Render disk) that does not exist until
  // a disk is attached — create it, or fall back to the default location.
  fs.mkdirSync(path.dirname(resolved), { recursive: true });
} catch (err) {
  console.warn(`[db] Cannot create DB directory ${path.dirname(resolved)} (${err.message}); using default path`);
  resolved = path.join(__dirname, '..', 'database.sqlite');
}
const db = new Database(resolved);

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
