// backend/config/db.js
import pkg from "pg";
import dotenv from "dotenv";
dotenv.config();

const { Pool } = pkg;

const PG_HOST = process.env.PG_HOST || "127.0.0.1";
const PG_USER = process.env.PG_USER || "postgres";
const PG_PASSWORD = process.env.PG_PASSWORD || "";
const PG_DATABASE = process.env.PG_DATABASE || "hostel_management";
const PG_PORT = process.env.PG_PORT ? Number(process.env.PG_PORT) : 5432;
const PG_MAX = process.env.PG_MAX ? Number(process.env.PG_MAX) : 10;

console.log("DB config (config/db.js):", {
  PG_HOST,
  PG_USER,
  PG_PASSWORD: PG_PASSWORD ? "*****" : "(empty)",
  PG_DATABASE,
  PG_PORT,
  PG_MAX,
});

export const db = new Pool({
  host: PG_HOST,
  user: PG_USER,
  password: PG_PASSWORD,
  database: PG_DATABASE,
  port: PG_PORT,
  max: PG_MAX,
  idleTimeoutMillis: 30000,
  // connectionTimeoutMillis: 2000, // optional
});

// Optional: handle pool errors
db.on("error", (err) => {
  console.error("Unexpected error on idle Postgres client", err);
  // process.exit(-1); // you may choose to exit in prod
});
