import pkg from "pg";
import dotenv from "dotenv";
dotenv.config();

const { Pool } = pkg;

let db;

if (process.env.DATABASE_URL) {
  // Render production
  console.log("Using DATABASE_URL from Render");

  db = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
  });
} else {
  // Local development
  console.log("Using local PostgreSQL settings");

  db = new Pool({
    host: process.env.PG_HOST || "127.0.0.1",
    user: process.env.PG_USER || "postgres",
    password: process.env.PG_PASSWORD || "",
    database: process.env.PG_DATABASE || "hostel_management",
    port: process.env.PG_PORT ? Number(process.env.PG_PORT) : 5432,
  });
}

export { db };
