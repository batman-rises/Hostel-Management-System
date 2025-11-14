// backend/seed.js
import bcrypt from "bcryptjs";
import { query, execute, pool } from "./utils/dbHelper.js";

async function safeExecute(sql, params = []) {
  try {
    const res = await execute(sql, params);
    return res;
  } catch (err) {
    console.error("SQL error:", err.message || err);
    throw err;
  }
}

async function rowExists(sql, params = []) {
  const [rows] = await query(sql, params);
  return Array.isArray(rows) && rows.length > 0;
}

async function makeSampleRooms() {
  console.log("Seeding rooms...");
  // try to create a rooms table only if it doesn't exist (best-effort)
  await safeExecute(`
    CREATE TABLE IF NOT EXISTS rooms (
      room_id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(100),
      capacity INT DEFAULT 1,
      price DECIMAL(10,2) DEFAULT 0,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

  const sampleRooms = [
    { name: "A-101", capacity: 2, price: 2000 },
    { name: "A-102", capacity: 2, price: 2000 },
    { name: "B-201", capacity: 1, price: 1500 },
  ];

  for (const r of sampleRooms) {
    const exists = await rowExists("SELECT 1 FROM rooms WHERE name = ?", [
      r.name,
    ]);
    if (!exists) {
      const res = await safeExecute(
        "INSERT INTO rooms (name, capacity, price) VALUES (?, ?, ?)",
        [r.name, r.capacity, r.price]
      );
      console.log("Inserted room:", r.name, "id:", res.insertId);
    } else {
      console.log("Room already exists:", r.name);
    }
  }
}

async function makeSampleStudents() {
  console.log("Seeding students...");

  // ensure students table present (best-effort)
  await safeExecute(`
    CREATE TABLE IF NOT EXISTS students (
      student_id INT AUTO_INCREMENT PRIMARY KEY,
      first_name VARCHAR(50),
      last_name VARCHAR(50),
      gender VARCHAR(10),
      phone VARCHAR(20),
      email VARCHAR(150) UNIQUE,
      password VARCHAR(255),
      room_id INT NULL,
      date_of_joining DATE,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

  const sample = {
    first_name: "Alice",
    last_name: "Kumar",
    email: "alice@test.com",
    phone: "9999000001",
    gender: "Female",
    password_plain: "123",
  };

  const exists = await rowExists("SELECT 1 FROM students WHERE email = ?", [
    sample.email,
  ]);
  if (!exists) {
    const hashed = await bcrypt.hash(sample.password_plain, 10);
    const res = await safeExecute(
      `INSERT INTO students
      (first_name,last_name,gender,phone,email,password,date_of_joining)
      VALUES (?, ?, ?, ?, ?, ?, CURDATE())`,
      [
        sample.first_name,
        sample.last_name,
        sample.gender,
        sample.phone,
        sample.email,
        hashed,
      ]
    );
    console.log("Inserted student:", sample.email, "id:", res.insertId);
  } else {
    console.log("Student already exists:", sample.email);
  }
}

async function makeAdminUser() {
  // not all projects have an 'admins' table — this is best-effort
  try {
    await safeExecute(`
      CREATE TABLE IF NOT EXISTS admins (
        admin_id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(100),
        email VARCHAR(150) UNIQUE,
        password VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    const adminEmail = "admin@hostel.test";
    const exists = await rowExists("SELECT 1 FROM admins WHERE email = ?", [
      adminEmail,
    ]);
    if (!exists) {
      const hashed = await bcrypt.hash("admin123", 10);
      const r = await safeExecute(
        "INSERT INTO admins (name, email, password) VALUES (?, ?, ?)",
        ["Admin User", adminEmail, hashed]
      );
      console.log("Inserted admin:", adminEmail, "id:", r.insertId);
    } else {
      console.log("Admin already exists:", adminEmail);
    }
  } catch (err) {
    console.log(
      "Skipping admin seeding (admins table may not be used).",
      err.message
    );
  }
}

async function main() {
  console.log("Starting seed...");
  try {
    await makeSampleRooms();
    await makeSampleStudents();
    await makeAdminUser();
    console.log("Seeding complete.");
  } catch (err) {
    console.error("Seeding failed:", err);
  } finally {
    // close pool
    try {
      if (pool && typeof pool.end === "function") {
        await pool.end();
      }
    } catch {}
    process.exit();
  }
}

main();
