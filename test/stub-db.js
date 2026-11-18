// Replaces api/_core/db.js with a fake before any module loads it, so actions can be tested without Postgres.
// Each test sets db.on(handler): handler(sql, params) returns the rows for that query (or undefined for none).
// db.sql lists every query the code ran, to check what it did.
const path = require("path");

const file = require.resolve(path.join(__dirname, "../api/_core/db"));
const db = {
  handler: () => [],
  sql: [],
  on(h) { this.handler = h; this.sql = []; },
  ran(re) { return this.sql.some((s) => re.test(s)); }
};
require.cache[file] = {
  id: file, filename: file, loaded: true,
  exports: {
    CONN: "stub",
    migrate: async () => {},
    db: async () => { throw new Error("no transactions in tests"); },
    q: async (sql, params) => { db.sql.push(sql); return { rows: (await db.handler(sql, params || [])) || [] }; }
  }
};
module.exports = db;
