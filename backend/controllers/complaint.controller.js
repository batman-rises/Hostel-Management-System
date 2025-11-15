// controllers/complaint.controller.js
import { db } from "../config/db.js";

// Student raises complaint
export const createComplaint = async (req, res) => {
  try {
    const { student_id, title, description } = req.body;

    const result = await db.query(
      `INSERT INTO complaints (student_id, title, description)
       VALUES ($1, $2, $3)
       RETURNING complaint_id, student_id, title, description, status, created_at`,
      [student_id, title, description]
    );

    // return the inserted row if needed
    const inserted = result.rows[0];
    res
      .status(201)
      .json({ message: "Complaint submitted", complaint: inserted });
  } catch (err) {
    console.error("createComplaint error:", err);
    res.status(500).json({ message: err.message });
  }
};

// Admin gets all complaints
export const getAllComplaints = async (req, res) => {
  try {
    const result = await db.query(
      `SELECT c.*, s.first_name, s.last_name
       FROM complaints c
       JOIN students s ON c.student_id = s.student_id
       ORDER BY c.created_at DESC`
    );

    res.json(result.rows);
  } catch (err) {
    console.error("getAllComplaints error:", err);
    res.status(500).json({ message: err.message });
  }
};

// Update complaint status
export const resolveComplaint = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await db.query(
      `UPDATE complaints
       SET status = 'Resolved', resolved_at = NOW()
       WHERE complaint_id = $1`,
      [id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ message: "Complaint not found" });
    }

    res.json({ message: "Complaint resolved" });
  } catch (err) {
    console.error("resolveComplaint error:", err);
    res.status(500).json({ message: err.message });
  }
};
