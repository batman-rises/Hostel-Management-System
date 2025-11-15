// backend/controllers/admin.controller.js - PostgreSQL version
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import { query, execute } from "../utils/dbHelper.js";
dotenv.config();

/* -------------------------
  AUTH: register / login / profile
------------------------- */

export async function registerAdmin(req, res) {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password)
      return res
        .status(400)
        .json({ message: "name, email, password required" });

    // check existing
    const result = await query("SELECT admin_id FROM admins WHERE email = $1", [
      email,
    ]);
    const rows = result.rows;
    if (rows.length)
      return res.status(409).json({ message: "Admin already exists" });

    const hashed = await bcrypt.hash(password, 10);
    await execute(
      "INSERT INTO admins (name, email, password) VALUES ($1, $2, $3)",
      [name, email, hashed]
    );
    return res.status(201).json({ success: true, message: "Admin registered" });
  } catch (err) {
    console.error("registerAdmin error:", err);
    return res.status(500).json({ message: "Server error" });
  }
}

// export async function loginAdmin(req, res) {
//   try {
//     const { email, password } = req.body;
//     if (!email || !password)
//       return res.status(400).json({ message: "Email and password required" });

//     const result = await query(
//       "SELECT admin_id, name, email, password FROM admins WHERE email = $1",
//       [email]
//     );
//     const rows = result.rows;
//     if (!rows.length)
//       return res.status(401).json({ message: "Invalid email or password" });

//     const admin = rows[0];
//     const ok = await bcrypt.compare(password, admin.password);
//     if (!ok)
//       return res.status(401).json({ message: "Invalid email or password" });

//     // CRITICAL: role must be "admin" (so middleware accepts)
//     const token = jwt.sign(
//       {
//         admin_id: admin.admin_id,
//         email: admin.email,
//         role: "admin", // Always use "admin", not "warden"
//       },
//       process.env.JWT_SECRET,
//       { expiresIn: "7d" }
//     );

//     console.log("Admin login successful:", {
//       admin_id: admin.admin_id,
//       email: admin.email,
//       role: "admin",
//     });

//     return res.json({
//       success: true,
//       message: "Login successful",
//       token,
//       admin: {
//         admin_id: admin.admin_id,
//         name: admin.name,
//         email: admin.email,
//       },
//     });
//   } catch (err) {
//     console.error("loginAdmin error:", err);
//     return res.status(500).json({ message: "Server error" });
//   }
// }
export async function loginAdmin(req, res) {
  try {
    console.log("DEBUG loginAdmin called; body:", req.body);

    const { email, password } = req.body || {};
    if (!email || !password) {
      console.log("DEBUG loginAdmin - missing email/password");
      return res.status(400).json({ message: "Email and password required" });
    }

    const sql =
      "SELECT admin_id, name, email, password FROM admins WHERE email = $1";
    const params = [email];
    console.log("DEBUG loginAdmin - sql:", sql);
    console.log("DEBUG loginAdmin - params:", params);

    const result = await query(sql, params);
    console.log(
      "DEBUG loginAdmin - query result:",
      result && result.rows ? result.rows : result
    );

    if (!result || !result.rows || result.rows.length === 0) {
      return res
        .status(401)
        .json({ message: "Invalid email or password (no user)" });
    }

    const admin = result.rows[0];
    // Defensive check
    if (!admin.password) {
      console.error("DEBUG loginAdmin - admin row missing password:", admin);
      return res
        .status(500)
        .json({ message: "Server error - missing password hash" });
    }

    const ok = await bcrypt.compare(password, admin.password);
    if (!ok) {
      console.log("DEBUG loginAdmin - password mismatch for", email);
      return res
        .status(401)
        .json({ message: "Invalid email or password (mismatch)" });
    }

    const token = jwt.sign(
      { admin_id: admin.admin_id, email: admin.email, role: "admin" },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    return res.json({
      success: true,
      message: "Login successful",
      token,
      admin: { admin_id: admin.admin_id, name: admin.name, email: admin.email },
    });
  } catch (err) {
    console.error("DEBUG loginAdmin - caught error:", err);
    // Return full error for debugging (remove in prod)
    return res.status(500).json({
      message: "Server error in loginAdmin",
      error: err.message,
      stack: err.stack,
    });
  }
}

export async function getProfile(req, res) {
  try {
    const adminId = req.user?.admin_id ?? req.user?.id;
    if (!adminId)
      return res.status(400).json({ message: "Missing admin id in token" });

    const result = await query(
      "SELECT admin_id, name, email, created_at FROM admins WHERE admin_id = $1",
      [adminId]
    );
    const rows = result.rows;
    if (!rows.length)
      return res.status(404).json({ message: "Admin not found" });

    return res.json(rows[0]);
  } catch (err) {
    console.error("getProfile admin error:", err);
    return res.status(500).json({ message: "Server error" });
  }
}

/* -------------------------
   ADMIN dashboards & data endpoints
------------------------- */

export async function getDashboard(req, res) {
  try {
    const sR = await query("SELECT COUNT(*) AS cnt FROM students");
    const rR = await query("SELECT COUNT(*) AS cnt FROM rooms");
    const paidR = await query(
      "SELECT COUNT(*) AS cnt FROM payments WHERE status = 'Paid'"
    );
    const pendingR = await query(
      "SELECT COUNT(*) AS cnt FROM payments WHERE status != 'Paid'"
    );
    const openR = await query(
      "SELECT COUNT(*) AS cnt FROM complaints WHERE status != 'Resolved'"
    );

    const students = Number(sR.rows[0].cnt) || 0;
    const rooms = Number(rR.rows[0].cnt) || 0;
    const paymentsPaid = Number(paidR.rows[0].cnt) || 0;
    const paymentsPending = Number(pendingR.rows[0].cnt) || 0;
    const complaintsOpen = Number(openR.rows[0].cnt) || 0;

    return res.json({
      students,
      rooms,
      paymentsPaid,
      paymentsPending,
      complaintsOpen,
    });
  } catch (err) {
    console.error("getDashboard error:", err);
    return res.status(500).json({ message: "Server error" });
  }
}

export async function getStudents(req, res) {
  try {
    const { q, limit = 100, offset = 0 } = req.query;
    let sql = `SELECT student_id, first_name, last_name, email, phone, gender, room_id, date_of_joining FROM students`;
    const params = [];
    if (q) {
      sql +=
        " WHERE first_name ILIKE $1 OR last_name ILIKE $2 OR email ILIKE $3";
      params.push(`%${q}%`, `%${q}%`, `%${q}%`);
      sql += " ORDER BY student_id DESC LIMIT $4 OFFSET $5";
      params.push(Number(limit), Number(offset));
    } else {
      sql += " ORDER BY student_id DESC LIMIT $1 OFFSET $2";
      params.push(Number(limit), Number(offset));
    }
    const result = await query(sql, params);
    return res.json(result.rows);
  } catch (err) {
    console.error("getStudents error:", err);
    return res.status(500).json({ message: "Server error" });
  }
}

export async function getRooms(req, res) {
  try {
    const sql = `
      SELECT r.room_id, r.room_number, r.capacity, r.status,
             COALESCE(COUNT(s.student_id),0) AS occupants
      FROM rooms r
      LEFT JOIN students s ON s.room_id = r.room_id
      GROUP BY r.room_id
      ORDER BY r.room_number
    `;
    const result = await query(sql);
    return res.json(result.rows);
  } catch (err) {
    console.error("getRooms error:", err);
    return res.status(500).json({ message: "Server error" });
  }
}

export async function updateRoomStatus(req, res) {
  try {
    const { room_id } = req.params;
    const { status } = req.body;
    const allowed = [
      "Available",
      "available",
      "Full",
      "full",
      "maintenance",
      "Maintenance",
    ];
    if (!status || !allowed.includes(status)) {
      return res.status(400).json({
        message: "Invalid status. allowed: available, full, maintenance",
      });
    }
    await execute("UPDATE rooms SET status = $1 WHERE room_id = $2", [
      status,
      room_id,
    ]);
    return res.json({ success: true, message: "Room updated" });
  } catch (err) {
    console.error("updateRoomStatus error:", err);
    return res.status(500).json({ message: "Server error" });
  }
}

export async function getPayments(req, res) {
  try {
    const sql = `
      SELECT p.payment_id, p.student_id, p.amount, p.month, p.payment_method, p.payment_date, p.status,
             s.first_name, s.last_name, s.email
      FROM payments p
      LEFT JOIN students s ON s.student_id = p.student_id
      ORDER BY p.payment_date DESC
      LIMIT 1000
    `;
    const result = await query(sql);
    return res.json(result.rows);
  } catch (err) {
    console.error("getPayments error:", err);
    return res.status(500).json({ message: "Server error" });
  }
}

export async function getComplaints(req, res) {
  try {
    const sql = `
      SELECT c.complaint_id, c.student_id, c.title, c.description AS details, c.status, c.created_at,
             s.first_name, s.last_name, s.email
      FROM complaints c
      LEFT JOIN students s ON s.student_id = c.student_id
      ORDER BY c.created_at DESC
      LIMIT 1000
    `;
    const result = await query(sql);
    return res.json(result.rows);
  } catch (err) {
    console.error("getComplaints error:", err);
    return res.status(500).json({ message: "Server error" });
  }
}

export async function updateComplaintStatus(req, res) {
  try {
    const { complaint_id } = req.params;
    const { status } = req.body;
    const allowed = [
      "Pending",
      "In Progress",
      "Resolved",
      "pending",
      "in_progress",
      "resolved",
      "open",
    ];
    if (!status) return res.status(400).json({ message: "Missing status" });
    await execute("UPDATE complaints SET status = $1 WHERE complaint_id = $2", [
      status,
      complaint_id,
    ]);
    return res.json({ success: true });
  } catch (err) {
    console.error("updateComplaintStatus error:", err);
    return res.status(500).json({ message: "Server error" });
  }
}
