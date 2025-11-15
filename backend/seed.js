// backend/seed.js  (POSTGRES VERSION - COMPREHENSIVE DATA)
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
  console.log("\n👤 Seeding admin...");

  const adminEmail = "admin@example.com";
  const passwordPlain = "Admin@123";

  const exists = await rowExists(`SELECT 1 FROM admins WHERE email = $1`, [
    adminEmail,
  ]);

  if (exists) {
    console.log("✓ Admin already exists:", adminEmail);
    return;
  }

  const hashed = await bcrypt.hash(passwordPlain, 10);

  const res = await safeExecute(
    `INSERT INTO admins (name, email, password)
     VALUES ($1, $2, $3)
     RETURNING admin_id`,
    ["Super Admin", adminEmail, hashed]
  );

  console.log("✅ Inserted admin:", adminEmail, "id:", res.rows[0].admin_id);
}

/* ----------------------------------------------------
   ROOMS SEED - 30 Rooms across 3 buildings
----------------------------------------------------- */
async function seedRooms() {
  console.log("\n🏢 Seeding rooms...");

  const rooms = [
    // Building A - Ground Floor (Single rooms - Premium)
    { room_number: "A101", capacity: 1, price: 3500, status: "Available" },
    { room_number: "A102", capacity: 1, price: 3500, status: "Available" },
    { room_number: "A103", capacity: 1, price: 3500, status: "Available" },
    { room_number: "A104", capacity: 1, price: 3500, status: "Available" },
    { room_number: "A105", capacity: 1, price: 3500, status: "Maintenance" },

    // Building A - First Floor (Double rooms)
    { room_number: "A201", capacity: 2, price: 5000, status: "Available" },
    { room_number: "A202", capacity: 2, price: 5000, status: "Available" },
    { room_number: "A203", capacity: 2, price: 5000, status: "Available" },
    { room_number: "A204", capacity: 2, price: 5000, status: "Available" },
    { room_number: "A205", capacity: 2, price: 5000, status: "Available" },

    // Building B - Ground Floor (Triple rooms)
    { room_number: "B101", capacity: 3, price: 6500, status: "Available" },
    { room_number: "B102", capacity: 3, price: 6500, status: "Available" },
    { room_number: "B103", capacity: 3, price: 6500, status: "Available" },
    { room_number: "B104", capacity: 3, price: 6500, status: "Available" },
    { room_number: "B105", capacity: 3, price: 6500, status: "Available" },

    // Building B - First Floor (Double rooms)
    { room_number: "B201", capacity: 2, price: 4500, status: "Available" },
    { room_number: "B202", capacity: 2, price: 4500, status: "Available" },
    { room_number: "B203", capacity: 2, price: 4500, status: "Available" },
    { room_number: "B204", capacity: 2, price: 4500, status: "Available" },
    { room_number: "B205", capacity: 2, price: 4500, status: "Maintenance" },

    // Building C - Ground Floor (Quad rooms - Economy)
    { room_number: "C101", capacity: 4, price: 7500, status: "Available" },
    { room_number: "C102", capacity: 4, price: 7500, status: "Available" },
    { room_number: "C103", capacity: 4, price: 7500, status: "Available" },
    { room_number: "C104", capacity: 4, price: 7500, status: "Available" },
    { room_number: "C105", capacity: 4, price: 7500, status: "Available" },

    // Building C - First Floor (Triple rooms)
    { room_number: "C201", capacity: 3, price: 6000, status: "Available" },
    { room_number: "C202", capacity: 3, price: 6000, status: "Available" },
    { room_number: "C203", capacity: 3, price: 6000, status: "Available" },
    { room_number: "C204", capacity: 3, price: 6000, status: "Available" },
    { room_number: "C205", capacity: 3, price: 6000, status: "Available" },
  ];

  let insertedCount = 0;
  for (const r of rooms) {
    const exists = await rowExists(
      `SELECT 1 FROM rooms WHERE room_number = $1`,
      [r.room_number]
    );

    if (exists) {
      console.log("✓ Room exists:", r.room_number);
      continue;
    }

    const res = await safeExecute(
      `INSERT INTO rooms (room_number, capacity, price, status, occupied)
       VALUES ($1, $2, $3, $4, 0)
       RETURNING room_id`,
      [r.room_number, r.capacity, r.price, r.status]
    );

    insertedCount++;
  }

  console.log(`✅ Inserted ${insertedCount} rooms (Total: ${rooms.length})`);
}

/* ----------------------------------------------------
   STUDENTS SEED - 25 Students including your test student
----------------------------------------------------- */
async function seedStudents() {
  console.log("\n👨‍🎓 Seeding students...");

  const students = [
    // Your custom test student
    {
      first_name: "Test",
      last_name: "User",
      email: "test@gmail.com",
      password: "123",
      gender: "Male",
      phone: "9876543210",
      room_id: null,
    },
    // Other students
    {
      first_name: "John",
      last_name: "Doe",
      email: "john.doe@example.com",
      password: "Student@123",
      gender: "Male",
      phone: "9876543211",
      room_id: null,
    },
    {
      first_name: "Jane",
      last_name: "Smith",
      email: "jane.smith@example.com",
      password: "Student@123",
      gender: "Female",
      phone: "9876543212",
      room_id: null,
    },
    {
      first_name: "Michael",
      last_name: "Johnson",
      email: "michael.j@example.com",
      password: "Student@123",
      gender: "Male",
      phone: "9876543213",
      room_id: null,
    },
    {
      first_name: "Emily",
      last_name: "Brown",
      email: "emily.brown@example.com",
      password: "Student@123",
      gender: "Female",
      phone: "9876543214",
      room_id: null,
    },
    {
      first_name: "David",
      last_name: "Wilson",
      email: "david.wilson@example.com",
      password: "Student@123",
      gender: "Male",
      phone: "9876543215",
      room_id: null,
    },
    {
      first_name: "Sarah",
      last_name: "Davis",
      email: "sarah.davis@example.com",
      password: "Student@123",
      gender: "Female",
      phone: "9876543216",
      room_id: null,
    },
    {
      first_name: "Robert",
      last_name: "Miller",
      email: "robert.miller@example.com",
      password: "Student@123",
      gender: "Male",
      phone: "9876543217",
      room_id: null,
    },
    {
      first_name: "Lisa",
      last_name: "Garcia",
      email: "lisa.garcia@example.com",
      password: "Student@123",
      gender: "Female",
      phone: "9876543218",
      room_id: null,
    },
    {
      first_name: "James",
      last_name: "Martinez",
      email: "james.martinez@example.com",
      password: "Student@123",
      gender: "Male",
      phone: "9876543219",
      room_id: null,
    },
    {
      first_name: "Maria",
      last_name: "Rodriguez",
      email: "maria.rodriguez@example.com",
      password: "Student@123",
      gender: "Female",
      phone: "9876543220",
      room_id: null,
    },
    {
      first_name: "William",
      last_name: "Hernandez",
      email: "william.h@example.com",
      password: "Student@123",
      gender: "Male",
      phone: "9876543221",
      room_id: null,
    },
    {
      first_name: "Linda",
      last_name: "Lopez",
      email: "linda.lopez@example.com",
      password: "Student@123",
      gender: "Female",
      phone: "9876543222",
      room_id: null,
    },
    {
      first_name: "Richard",
      last_name: "Gonzalez",
      email: "richard.g@example.com",
      password: "Student@123",
      gender: "Male",
      phone: "9876543223",
      room_id: null,
    },
    {
      first_name: "Patricia",
      last_name: "Wilson",
      email: "patricia.wilson@example.com",
      password: "Student@123",
      gender: "Female",
      phone: "9876543224",
      room_id: null,
    },
    {
      first_name: "Thomas",
      last_name: "Anderson",
      email: "thomas.anderson@example.com",
      password: "Student@123",
      gender: "Male",
      phone: "9876543225",
      room_id: null,
    },
    {
      first_name: "Jennifer",
      last_name: "Taylor",
      email: "jennifer.taylor@example.com",
      password: "Student@123",
      gender: "Female",
      phone: "9876543226",
      room_id: null,
    },
    {
      first_name: "Charles",
      last_name: "Moore",
      email: "charles.moore@example.com",
      password: "Student@123",
      gender: "Male",
      phone: "9876543227",
      room_id: null,
    },
    {
      first_name: "Elizabeth",
      last_name: "Jackson",
      email: "elizabeth.j@example.com",
      password: "Student@123",
      gender: "Female",
      phone: "9876543228",
      room_id: null,
    },
    {
      first_name: "Daniel",
      last_name: "Martin",
      email: "daniel.martin@example.com",
      password: "Student@123",
      gender: "Male",
      phone: "9876543229",
      room_id: null,
    },
    {
      first_name: "Nancy",
      last_name: "Lee",
      email: "nancy.lee@example.com",
      password: "Student@123",
      gender: "Female",
      phone: "9876543230",
      room_id: null,
    },
    {
      first_name: "Matthew",
      last_name: "Perez",
      email: "matthew.perez@example.com",
      password: "Student@123",
      gender: "Male",
      phone: "9876543231",
      room_id: null,
    },
    {
      first_name: "Betty",
      last_name: "Thompson",
      email: "betty.thompson@example.com",
      password: "Student@123",
      gender: "Female",
      phone: "9876543232",
      room_id: null,
    },
    {
      first_name: "Anthony",
      last_name: "White",
      email: "anthony.white@example.com",
      password: "Student@123",
      gender: "Male",
      phone: "9876543233",
      room_id: null,
    },
    {
      first_name: "Sandra",
      last_name: "Harris",
      email: "sandra.harris@example.com",
      password: "Student@123",
      gender: "Female",
      phone: "9876543234",
      room_id: null,
    },
    {
      first_name: "Mark",
      last_name: "Clark",
      email: "mark.clark@example.com",
      password: "Student@123",
      gender: "Male",
      phone: "9876543235",
      room_id: null,
    },
  ];

  let insertedCount = 0;
  for (const s of students) {
    const exists = await rowExists(`SELECT 1 FROM students WHERE email = $1`, [
      s.email,
    ]);

    if (exists) {
      console.log("✓ Student exists:", s.email);
      continue;
    }

    const hashed = await bcrypt.hash(s.password, 10);

    const res = await safeExecute(
      `INSERT INTO students 
        (first_name, last_name, gender, phone, email, password, room_id, date_of_joining)
       VALUES ($1, $2, $3, $4, $5, $6, $7, CURRENT_DATE)
       RETURNING student_id`,
      [s.first_name, s.last_name, s.gender, s.phone, s.email, hashed, s.room_id]
    );

    insertedCount++;
  }

  console.log(
    `✅ Inserted ${insertedCount} students (Total: ${students.length})`
  );
}

/* ----------------------------------------------------
   PAYMENTS SEED - Sample payment records
----------------------------------------------------- */
async function seedPayments() {
  console.log("\n💳 Seeding payments...");

  // Get all students
  const studentsRes = await query(`SELECT student_id FROM students LIMIT 10`);
  const students = studentsRes.rows;

  if (students.length === 0) {
    console.log("⚠️  No students found, skipping payments");
    return;
  }

  const months = [
    "2025-01",
    "2025-02",
    "2025-03",
    "2025-04",
    "2025-05",
    "2025-06",
    "2025-07",
    "2025-08",
    "2025-09",
    "2025-10",
  ];

  let insertedCount = 0;
  for (const student of students) {
    // Add 3-5 payment records per student
    const numPayments = Math.floor(Math.random() * 3) + 3;

    for (let i = 0; i < numPayments; i++) {
      const month = months[i];
      const amount = 3000 + Math.floor(Math.random() * 4000);
      const status = Math.random() > 0.2 ? "Paid" : "Pending";
      const method = ["Cash", "UPI", "Card", "Online"][
        Math.floor(Math.random() * 4)
      ];

      const exists = await rowExists(
        `SELECT 1 FROM payments WHERE student_id = $1 AND month = $2`,
        [student.student_id, month]
      );

      if (!exists) {
        await safeExecute(
          `INSERT INTO payments (student_id, amount, month, status, payment_method, payment_date)
           VALUES ($1, $2, $3, $4, $5, CURRENT_DATE)`,
          [student.student_id, amount, month, status, method]
        );
        insertedCount++;
      }
    }
  }

  console.log(`✅ Inserted ${insertedCount} payment records`);
}

/* ----------------------------------------------------
   COMPLAINTS SEED - Sample complaints
----------------------------------------------------- */
async function seedComplaints() {
  console.log("\n📝 Seeding complaints...");

  // Get all students
  const studentsRes = await query(`SELECT student_id FROM students LIMIT 8`);
  const students = studentsRes.rows;

  if (students.length === 0) {
    console.log("⚠️  No students found, skipping complaints");
    return;
  }

  const complaints = [
    {
      title: "WiFi not working",
      description:
        "Internet connection is very slow in room A101. Need immediate attention.",
    },
    {
      title: "AC Malfunction",
      description:
        "The air conditioning unit is making loud noises and not cooling properly.",
    },
    {
      title: "Water Leakage",
      description: "There is water leaking from the ceiling in the bathroom.",
    },
    {
      title: "Broken Window",
      description: "The window in my room is broken and needs replacement.",
    },
    {
      title: "Pest Control Required",
      description:
        "Found cockroaches in the common area. Need pest control service.",
    },
    {
      title: "Light Not Working",
      description: "The light fixture in my room stopped working yesterday.",
    },
    {
      title: "Noisy Neighbors",
      description:
        "The students in the next room are too loud during study hours.",
    },
    {
      title: "Elevator Issue",
      description: "The elevator has been stuck multiple times this week.",
    },
  ];

  let insertedCount = 0;
  for (let i = 0; i < students.length; i++) {
    const complaint = complaints[i];
    const status = ["Pending", "In Progress", "Resolved"][
      Math.floor(Math.random() * 3)
    ];

    await safeExecute(
      `INSERT INTO complaints (student_id, title, description, status, created_at)
       VALUES ($1, $2, $3, $4, CURRENT_TIMESTAMP - INTERVAL '${Math.floor(
         Math.random() * 30
       )} days')`,
      [students[i].student_id, complaint.title, complaint.description, status]
    );
    insertedCount++;
  }

  console.log(`✅ Inserted ${insertedCount} complaints`);
}

/* ----------------------------------------------------
   MAIN
----------------------------------------------------- */
async function main() {
  console.log("🌱 Starting PostgreSQL comprehensive seed...\n");
  console.log("=".repeat(50));

  try {
    await seedAdmin();
    await seedRooms();
    await seedStudents();
    await seedPayments();
    await seedComplaints();

    console.log("\n" + "=".repeat(50));
    console.log("✅ Seeding complete!\n");
    console.log("📧 Login Credentials:");
    console.log("   Admin: admin@example.com / Admin@123");
    console.log("   Student: test@gmail.com / 123");
    console.log("=".repeat(50) + "\n");
  } catch (err) {
    console.error("❌ Seeding failed:", err);
  } finally {
    try {
      await pool._pgPool.end();
    } catch (e) {}
    process.exit();
  }
}

main();
