// backend/utils/dbHelper.js
// Postgres helper compatible with your controllers.
// - query(sql, params) returns the pg Result object ({ rows, rowCount, ... })
// - execute(sql, params) is an alias for query (useful for INSERT/UPDATE/DELETE)
// - pool.getConnection() returns a small wrapper with beginTransaction/commit/rollback/query/execute/release
import { db } from "../config/db.js"; // db is a pg.Pool

/**
 * Run a query using the pool. Returns the pg Result object.
 * Example usage:
 *   const res = await query("SELECT * FROM students WHERE id = $1", [id]);
 *   console.log(res.rows);
 */
export async function query(sql, params = []) {
  // ensure params is an array
  const p = Array.isArray(params) ? params : [params];
  const res = await db.query(sql, p);
  return res; // has .rows, .rowCount, etc.
}

/**
 * Execute (alias to query) - used historically for INSERT/UPDATE/DELETE.
 * Returns Result (if INSERT with RETURNING will be in result.rows).
 */
export async function execute(sql, params = []) {
  return query(sql, params);
}

/**
 * Provide a mysql2-like getConnection() wrapper for existing code that expects
 * conn.beginTransaction(), conn.query(), conn.execute(), conn.commit(), conn.rollback(), conn.release()
 *
 * This returns an object backed by a single pg Client.
 */
export async function getConnection() {
  const client = await db.connect();

  const wrapper = {
    // Runs a query on the client and returns the pg Result
    query: async (sql, params = []) => {
      const p = Array.isArray(params) ? params : [params];
      return client.query(sql, p);
    },
    execute: async (sql, params = []) => {
      const p = Array.isArray(params) ? params : [params];
      return client.query(sql, p);
    },
    beginTransaction: async () => {
      await client.query("BEGIN");
    },
    commit: async () => {
      await client.query("COMMIT");
    },
    rollback: async () => {
      await client.query("ROLLBACK");
    },
    release: () => {
      try {
        client.release();
      } catch (e) {
        // ignore
      }
    },
  };

  return wrapper;
}

// Export a pool wrapper that supports getConnection() similar to mysql2
export const pool = {
  getConnection: async () => {
    return getConnection();
  },
  // Expose the underlying pg Pool in case callers need it
  _pgPool: db,
};
