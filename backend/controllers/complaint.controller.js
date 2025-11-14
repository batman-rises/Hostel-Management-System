import { db } from "../config/db.js";

// Student raises complaint
export const createComplaint = async (req, res) => {
  try {
    const { student_id, title, description } = req.body;
    await db.query(
      "INSERT INTO complaints (student_id, title, description) VALUES (?, ?, ?)",
      [student_id, title, description]
    );
    res.json({ message: "Complaint submitted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Admin gets all complaints
export const getAllComplaints = async (req, res) => {
  try {
    const [rows] = await db.query(
      "SELECT c.*, s.first_name, s.last_name FROM complaints c JOIN students s ON c.student_id = s.student_id"
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Update complaint status
export const resolveComplaint = async (req, res) => {
  try {
    const { id } = req.params;
    await db.query(
      "UPDATE complaints SET status='Resolved' WHERE complaint_id=?",
      [id]
    );
    res.json({ message: "Complaint resolved" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
