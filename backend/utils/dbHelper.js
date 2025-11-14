// backend/utils/dbHelper.js
import { db } from "../config/db.js"; // use the single pool created in config/db.js

export async function query(sql, params) {
  const conn = await db.getConnection();
  try {
    const [rows, fields] = await conn.query(sql, params);
    return [rows, fields];
  } finally {
    conn.release();
  }
}

export async function execute(sql, params) {
  const conn = await db.getConnection();
  try {
    const [result] = await conn.execute(sql, params);
    return result;
  } finally {
    conn.release();
  }
}

export { db as pool };
