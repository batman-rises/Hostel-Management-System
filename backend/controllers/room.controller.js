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
    const rows =
      raw.rows ?? (Array.isArray(raw) && Array.isArray(raw[0]) ? raw[0] : raw);
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
    const insertRes = await query(
      `INSERT INTO rooms (room_number, capacity, occupied, status)
       VALUES ($1, $2, 0, $3)
       RETURNING room_id`,
      [room_number, Number(capacity), status]
    );
    const inserted = insertRes.rows && insertRes.rows[0];
    return res.status(201).json({ room_id: inserted?.room_id ?? null });
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
    let idx = 1;

    if (room_number !== undefined) {
      updates.push(`room_number = $${idx++}`);
      params.push(room_number);
    }
    if (capacity !== undefined) {
      updates.push(`capacity = $${idx++}`);
      params.push(Number(capacity));
    }
    if (status !== undefined) {
      updates.push(`status = $${idx++}`);
      params.push(status);
    }
    if (!updates.length) return res.status(400).json({ message: "No fields" });

    params.push(id); // last param is id
    const sql = `UPDATE rooms SET ${updates.join(
      ", "
    )} WHERE room_id = $${idx}`;
    const updateRes = await query(sql, params);

    if (updateRes.rowCount === 0) {
      return res.status(404).json({ message: "Room not found" });
    }

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
    const delRes = await query("DELETE FROM rooms WHERE room_id = $1", [id]);

    if (delRes.rowCount === 0) {
      return res.status(404).json({ message: "Room not found" });
    }

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

  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    // lock room row
    const roomRes = await client.query(
      "SELECT * FROM rooms WHERE room_id = $1 FOR UPDATE",
      [roomId]
    );
    const roomRows = roomRes.rows || [];
    if (!roomRows.length) {
      await client.query("ROLLBACK");
      return res.status(404).json({ message: "Room not found" });
    }
    const room = roomRows[0];

    // recalc occupancy if needed or use occupied column
    const occupied = Number(room.occupied || 0);
    const capacity = Number(room.capacity || 1);
    if (occupied >= capacity || String(room.status).toLowerCase() === "full") {
      await client.query("ROLLBACK");
      return res.status(409).json({ message: "Room is full" });
    }

    // lock student row
    const studentRes = await client.query(
      "SELECT * FROM students WHERE student_id = $1 FOR UPDATE",
      [studentId]
    );
    const studentRows = studentRes.rows || [];
    if (!studentRows.length) {
      await client.query("ROLLBACK");
      return res.status(404).json({ message: "Student not found" });
    }
    const student = studentRows[0];
    if (student.room_id) {
      await client.query("ROLLBACK");
      return res.status(400).json({ message: "Student already has a room" });
    }

    // assign student to room
    await client.query(
      "UPDATE students SET room_id = $1 WHERE student_id = $2",
      [roomId, studentId]
    );

    // increment occupied & update status if full
    const newOccupied = occupied + 1;
    const newStatus = newOccupied >= capacity ? "Full" : "Available";
    await client.query(
      "UPDATE rooms SET occupied = $1, status = $2 WHERE room_id = $3",
      [newOccupied, newStatus, roomId]
    );

    await client.query("COMMIT");
    return res.json({
      success: true,
      message: "Room booked",
      room_id: Number(roomId),
    });
  } catch (err) {
    try {
      await client.query("ROLLBACK");
    } catch (rollbackErr) {
      console.error("rollback error:", rollbackErr);
    }
    console.error("bookRoom error:", err);
    return res
      .status(500)
      .json({ message: "Server error", detail: err.message });
  } finally {
    client.release();
  }
}
