// backend/config/db.js
import mysql from "mysql2/promise";
import dotenv from "dotenv";
dotenv.config();

const DB_HOST = process.env.DB_HOST || "127.0.0.1";
const DB_USER = process.env.DB_USER || "root";
const DB_PASSWORD = process.env.DB_PASSWORD || "";
const DB_NAME = process.env.DB_NAME || "hostel_management";
const DB_PORT = process.env.DB_PORT ? Number(process.env.DB_PORT) : 3306;

console.log("DB config (config/db.js):", {
  DB_HOST,
  DB_USER,
  DB_PASSWORD: DB_PASSWORD ? "*****" : "(empty)",
  DB_NAME,
  DB_PORT,
});

export const db = mysql.createPool({
  host: DB_HOST,
  user: DB_USER,
  password: DB_PASSWORD,
  database: DB_NAME,
  port: DB_PORT,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  decimalNumbers: true,
});
