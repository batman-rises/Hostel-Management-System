// backend/controllers/student.controller.js
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { query, execute } from "../utils/dbHelper.js";
import dotenv from "dotenv";
dotenv.config();

/**
 * Register a new student
 */
export async function registerStudent(req, res) {
  console.log("registerStudent called — body:", req.body);

  try {
    const { first_name, last_name, gender, phone, email, password, room_id } =
      req.body;

    if (!first_name || !last_name || !email || !password) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    // Check if email already exists
    const [existingRows] = await query(
      "SELECT student_id FROM students WHERE email = ? LIMIT 1",
      [email]
    );
    if (existingRows && existingRows.length > 0) {
      return res.status(409).json({ message: "Email already registered" });
    }

    // Hash password
    const hashed = await bcrypt.hash(password, 10);

    // Insert student record (use execute for INSERT/UPDATE)
    const sql = `
      INSERT INTO students 
      (first_name, last_name, gender, phone, email, password, room_id, date_of_joining) 
      VALUES (?, ?, ?, ?, ?, ?, ?, CURDATE())
    `;
    const result = await execute(sql, [
      first_name,
      last_name,
      gender || null,
      phone || null,
      email,
      hashed,
      room_id || null,
    ]);

    // result.insertId contains the new id
    const studentId = result.insertId;

    console.log("Inserted student id:", studentId);

    // Generate token
    const token = jwt.sign(
      { student_id: studentId, role: "student", email },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    return res.status(201).json({
      success: true,
      message: "Student registered successfully",
      token,
      student: {
        student_id: studentId,
        first_name,
        last_name,
        email,
      },
    });
  } catch (err) {
    console.error("❌ Error registering student:", err?.stack || err);
    return res
      .status(500)
      .json({ message: "Server error", error: err?.message });
  }
}

/**
 * Student Login
 */
export async function loginStudent(req, res) {
  try {
    const { email, password } = req.body;
    const [rows] = await query("SELECT * FROM students WHERE email = ?", [
      email,
    ]);

    if (!rows || rows.length === 0) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    const user = rows[0];
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    const token = jwt.sign(
      { student_id: user.student_id, role: "student", email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    return res.json({
      success: true,
      message: "Login successful",
      token,
      student: {
        student_id: user.student_id,
        first_name: user.first_name,
        last_name: user.last_name,
        email: user.email,
      },
    });
  } catch (err) {
    console.error("❌ Error logging in:", err?.stack || err);
    return res
      .status(500)
      .json({ message: "Server error", error: err?.message });
  }
}

/**
 * Get Logged-in Student Profile
 */
export async function getProfile(req, res) {
  try {
    console.log("getProfile called; req.user:", req.user);
    const id = req.user?.student_id;
    console.log("getProfile: student_id:", id);

    const sql = `SELECT student_id, first_name, last_name, gender, phone, email, room_id, date_of_joining FROM students WHERE student_id = ?`;
    const rows = await query(sql, [id]);
    console.log("getProfile: query result (raw):", rows);

    // if query wrapper returns [rows, fields] handle both possibilities:
    const dataRows =
      Array.isArray(rows) && Array.isArray(rows[0]) ? rows[0] : rows;
    console.log("getProfile: normalized rows:", dataRows);

    if (!dataRows.length) {
      console.log("getProfile: no user found for id", id);
      return res.status(404).json({ message: "Student not found" });
    }

    console.log("getProfile: responding with user:", dataRows[0]);
    res.json(dataRows[0]);
  } catch (err) {
    console.error("❌ Error fetching profile:", err);
    res.status(500).json({ message: "Server error" });
  }
}

/**
 * Get Room details of the logged-in student
 * (Assuming there’s a 'rooms' table)
 */
export async function getStudentRoom(req, res) {
  try {
    const id = req.user.student_id;

    const [studentRows] = await query(
      "SELECT room_id FROM students WHERE student_id = ?",
      [id]
    );
    if (!studentRows || studentRows.length === 0) {
      return res.status(404).json({ message: "Student not found" });
    }

    const roomId = studentRows[0].room_id;
    if (!roomId) {
      return res
        .status(400)
        .json({ message: "Student not assigned to a room" });
    }

    // note: schema uses `room_id` as PK in rooms table
    const [roomRows] = await query("SELECT * FROM rooms WHERE room_id = ?", [
      roomId,
    ]);
    if (!roomRows || roomRows.length === 0) {
      return res.status(404).json({ message: "Room not found" });
    }

    return res.json(roomRows[0]);
  } catch (err) {
    console.error("❌ Error fetching student room:", err?.stack || err);
    return res
      .status(500)
      .json({ message: "Server error", error: err?.message });
  }
}

/**
 * Update logged-in student's profile
 * PUT /api/students/me
 * body: { first_name, last_name, phone, gender, password }
 */
export async function updateProfile(req, res) {
  try {
    const sid = req.user?.student_id;
    if (!sid) return res.status(401).json({ message: "Unauthorized" });

    const { first_name, last_name, phone, gender, password } = req.body;
    const fields = [];
    const params = [];

    if (first_name !== undefined) {
      fields.push("first_name = ?");
      params.push(first_name);
    }
    if (last_name !== undefined) {
      fields.push("last_name = ?");
      params.push(last_name);
    }
    if (phone !== undefined) {
      fields.push("phone = ?");
      params.push(phone);
    }
    if (gender !== undefined) {
      fields.push("gender = ?");
      params.push(gender);
    }
    if (password) {
      const hashed = await bcrypt.hash(password, 10);
      fields.push("password = ?");
      params.push(hashed);
    }

    if (fields.length === 0)
      return res.status(400).json({ message: "No fields to update" });

    params.push(sid);
    const sql = `UPDATE students SET ${fields.join(", ")} WHERE student_id = ?`;
    await execute(sql, params);

    // return fresh profile
    const raw = await query(
      "SELECT student_id, first_name, last_name, phone, gender, email, room_id, date_of_joining FROM students WHERE student_id = ?",
      [sid]
    );
    const rows = Array.isArray(raw) && Array.isArray(raw[0]) ? raw[0] : raw;
    return res.json(rows[0]);
  } catch (err) {
    console.error("updateProfile error:", err);
    return res.status(500).json({ message: "Server error" });
  }
}
