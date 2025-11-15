// backend/database/initDB.js
import pg from "pg";
import dotenv from "dotenv";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

dotenv.config();

const { Client } = pg;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DATABASE_URL = process.env.DATABASE_URL;
const clientConfig = DATABASE_URL
  ? {
      connectionString: DATABASE_URL,
      ssl: {
        rejectUnauthorized: false,
      },
    }
  : {
      host: process.env.DB_HOST || "localhost",
      port: process.env.DB_PORT || 5432,
      user: process.env.DB_USER || "postgres",
      password: process.env.DB_PASSWORD || "",
      database: process.env.DB_NAME || "hostel_management",
    };

async function initializeDatabase() {
  const client = new Client(clientConfig);

  try {
    console.log("🔌 Connecting to PostgreSQL...");
    if (DATABASE_URL) {
      console.log("Using DATABASE_URL from environment");
    } else {
      console.log(`Host: ${clientConfig.host}:${clientConfig.port}`);
      console.log(`Database: ${clientConfig.database}`);
    }

    await client.connect();
    console.log("✅ Connected successfully!");

    const schemaPath = path.join(__dirname, "schema.sql");
    const schema = fs.readFileSync(schemaPath, "utf8");

    console.log("\n📋 Executing schema...");
    await client.query(schema);
    console.log("✅ Schema executed successfully!");

    const tablesResult = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name;
    `);

    console.log("\n📊 Tables created:");
    tablesResult.rows.forEach((row) => {
      console.log(`  - ${row.table_name}`);
    });

    const seedPath = path.join(__dirname, "seeds.sql");
    if (fs.existsSync(seedPath)) {
      console.log("\n🌱 Running seed data...");
      const seeds = fs.readFileSync(seedPath, "utf8");
      await client.query(seeds);
      console.log("✅ Seed data inserted!");
    }

    console.log("\n🎉 Database initialized successfully!");
    console.log("\n📧 Default admin login:");
    console.log("   Email: admin@hostel.com");
    console.log("   Password: admin123");
    console.log("   ⚠️  Change this password immediately!\n");
  } catch (error) {
    console.error("❌ Error initializing database:", error.message);
    console.error("Full error:", error);
    process.exit(1);
  } finally {
    await client.end();
    console.log("🔌 Connection closed");
  }
}

initializeDatabase();
