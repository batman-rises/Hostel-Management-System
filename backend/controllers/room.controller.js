// backend/controllers/room.controller.js
import { query, execute, pool } from "../utils/dbHelper.js";

/* GET /api/rooms */
export async function getRooms(req, res) {
  try {
    const raw = await query(`
      SELECT r.room_id, r.room_number, r.capacity, r.occupied, r.status,
             COALESCE(cnt.cnt,0) AS occupants
      FROM rooms r
      LEFT JOIN (
        SELECT room_id, COUNT(*) AS cnt FROM students WHERE room_id IS NOT NULL GROUP BY room_id
      ) cnt ON cnt.room_id = r.room_id
      ORDER BY r.room_number
    `);
    const rows = Array.isArray(raw) && Array.isArray(raw[0]) ? raw[0] : raw;
    return res.json(rows);
  } catch (err) {
    console.error("getRooms error:", err);
    return res.status(500).json({ message: "Server error" });
  }
}

/* POST /api/rooms  (admin) */
export async function addRoom(req, res) {
  try {
    const { room_number, capacity = 2, status = "Available" } = req.body;
    const result = await execute(
      "INSERT INTO rooms (room_number, capacity, occupied, status) VALUES (?, ?, 0, ?)",
      [room_number, Number(capacity), status]
    );
    return res.status(201).json({ room_id: result.insertId });
  } catch (err) {
    console.error("addRoom error:", err);
    return res.status(500).json({ message: "Server error" });
  }
}

/* PUT /api/rooms/:id (admin) */
export async function updateRoom(req, res) {
  try {
    const id = req.params.id;
    const { room_number, capacity, status } = req.body;
    const updates = [];
    const params = [];
    if (room_number !== undefined) {
      updates.push("room_number = ?");
      params.push(room_number);
    }
    if (capacity !== undefined) {
      updates.push("capacity = ?");
      params.push(Number(capacity));
    }
    if (status !== undefined) {
      updates.push("status = ?");
      params.push(status);
    }
    if (!updates.length) return res.status(400).json({ message: "No fields" });
    params.push(id);
    await execute(
      `UPDATE rooms SET ${updates.join(", ")} WHERE room_id = ?`,
      params
    );
    return res.json({ success: true });
  } catch (err) {
    console.error("updateRoom error:", err);
    return res.status(500).json({ message: "Server error" });
  }
}

/* DELETE /api/rooms/:id (admin) */
export async function deleteRoom(req, res) {
  try {
    const id = req.params.id;
    await execute("DELETE FROM rooms WHERE room_id = ?", [id]);
    return res.json({ success: true });
  } catch (err) {
    console.error("deleteRoom error:", err);
    return res.status(500).json({ message: "Server error" });
  }
}

/**
 * POST /api/rooms/:room_id/book
 * Authenticated user must be a student (req.user.student_id) or admin can pass student_id in body
 * This uses a transaction and SELECT ... FOR UPDATE to prevent race conditions
 */
export async function bookRoom(req, res) {
  const roomId = req.params.room_id;
  const callerStudentId = req.user?.student_id;
  const providedStudentId = req.body?.student_id;
  const studentId = callerStudentId || providedStudentId;

  if (!studentId)
    return res
      .status(400)
      .json({ message: "student_id required (login as student)" });

  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    // lock room row
    const [roomRows] = await conn.query(
      "SELECT * FROM rooms WHERE room_id = ? FOR UPDATE",
      [roomId]
    );
    if (!roomRows.length) {
      await conn.rollback();
      return res.status(404).json({ message: "Room not found" });
    }
    const room = roomRows[0];

    // recalc occupancy if needed or use occupied column
    const occupied = room.occupied || 0;
    const capacity = room.capacity || 1;
    if (occupied >= capacity || String(room.status).toLowerCase() === "full") {
      await conn.rollback();
      return res.status(409).json({ message: "Room is full" });
    }

    // lock student row
    const [studentRows] = await conn.query(
      "SELECT * FROM students WHERE student_id = ? FOR UPDATE",
      [studentId]
    );
    if (!studentRows.length) {
      await conn.rollback();
      return res.status(404).json({ message: "Student not found" });
    }
    const student = studentRows[0];
    if (student.room_id) {
      await conn.rollback();
      return res.status(400).json({ message: "Student already has a room" });
    }

    // assign student to room
    await conn.execute("UPDATE students SET room_id = ? WHERE student_id = ?", [
      roomId,
      studentId,
    ]);

    // increment occupied & update status if full
    const newOccupied = occupied + 1;
    const newStatus = newOccupied >= capacity ? "Full" : "Available";
    await conn.execute(
      "UPDATE rooms SET occupied = ?, status = ? WHERE room_id = ?",
      [newOccupied, newStatus, roomId]
    );

    await conn.commit();
    return res.json({
      success: true,
      message: "Room booked",
      room_id: Number(roomId),
    });
  } catch (err) {
    try {
      await conn.rollback();
    } catch (e) {}
    console.error("bookRoom error:", err);
    return res
      .status(500)
      .json({ message: "Server error", detail: err.message });
  } finally {
    conn.release();
  }
}
