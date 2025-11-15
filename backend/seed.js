// backend/seed.js  (POSTGRES VERSION)
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
  const res = await query(sql, params);
  return res.rows.length > 0;
}

/* ----------------------------------------------------
   ADMIN SEED  (Login: admin@example.com / Admin@123)
----------------------------------------------------- */
async function seedAdmin() {
  console.log("Seeding admin...");

  const adminEmail = "admin@example.com";
  const passwordPlain = "Admin@123";

  const exists = await rowExists(`SELECT 1 FROM admins WHERE email = $1`, [
    adminEmail,
  ]);

  if (exists) {
    console.log("Admin already exists:", adminEmail);
    return;
  }

  const hashed = await bcrypt.hash(passwordPlain, 10);

  const res = await safeExecute(
    `INSERT INTO admins (name, email, password)
     VALUES ($1, $2, $3)
     RETURNING admin_id`,
    ["Super Admin", adminEmail, hashed]
  );

  console.log("Inserted admin:", adminEmail, "id:", res.rows[0].admin_id);
}

/* ----------------------------------------------------
   ROOMS SEED
----------------------------------------------------- */
async function seedRooms() {
  console.log("Seeding rooms...");

  const rooms = [
    { room_number: "A101", capacity: 2, price: 1500 },
    { room_number: "A102", capacity: 2, price: 1500 },
    { room_number: "B201", capacity: 3, price: 2000 },
  ];

  for (const r of rooms) {
    const exists = await rowExists(
      `SELECT 1 FROM rooms WHERE room_number = $1`,
      [r.room_number]
    );

    if (exists) {
      console.log("Room exists:", r.room_number);
      continue;
    }

    const res = await safeExecute(
      `INSERT INTO rooms (room_number, capacity, price)
       VALUES ($1, $2, $3)
       RETURNING room_id`,
      [r.room_number, r.capacity, r.price]
    );

    console.log("Inserted room:", r.room_number, "id:", res.rows[0].room_id);
  }
}

/* ----------------------------------------------------
   STUDENT SEED  (Login: student@example.com / Student@123)
----------------------------------------------------- */
async function seedStudent() {
  console.log("Seeding student...");

  const email = "student@example.com";
  const passwordPlain = "Student@123";

  const exists = await rowExists(`SELECT 1 FROM students WHERE email = $1`, [
    email,
  ]);

  if (exists) {
    console.log("Student already exists:", email);
    return;
  }

  const hashed = await bcrypt.hash(passwordPlain, 10);

  const res = await safeExecute(
    `INSERT INTO students 
      (first_name, last_name, gender, phone, email, password, date_of_joining)
     VALUES ($1, $2, $3, $4, $5, $6, CURRENT_DATE)
     RETURNING student_id`,
    ["John", "Doe", "Male", "9999000000", email, hashed]
  );

  console.log("Inserted student:", email, "id:", res.rows[0].student_id);
}

/* ----------------------------------------------------
   MAIN
----------------------------------------------------- */
async function main() {
  console.log("🌱 Starting PostgreSQL seed...");

  try {
    await seedAdmin();
    await seedRooms();
    await seedStudent();

    console.log("✅ Seeding complete.");
  } catch (err) {
    console.error("❌ Seeding failed:", err);
  } finally {
    try {
      await pool._pgPool.end(); // graceful shutdown
    } catch (e) {}
    process.exit();
  }
}

main();
