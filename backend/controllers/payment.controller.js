// backend/controllers/payment.controller.js
import { query, execute, pool } from "../utils/dbHelper.js";

/**
 * Student: create a payment record (marks as Paid)
 * POST /api/payments/pay
 * body: { month?: "YYYY-MM", amount?: number, payment_method?: string }
 */
export async function createPaymentByStudent(req, res) {
  try {
    const callerStudentId = req.user?.student_id;
    if (!callerStudentId)
      return res
        .status(401)
        .json({ message: "Must be logged in as a student to pay rent" });

    const providedMonth = req.body?.month;
    const now = new Date();
    const currentMonth = `${now.getFullYear()}-${String(
      now.getMonth() + 1
    ).padStart(2, "0")}`;
    const month =
      typeof providedMonth === "string" && providedMonth.trim() !== ""
        ? providedMonth.trim()
        : currentMonth;

    // helper to normalize different db wrapper return shapes
    const normalize = (r) => {
      if (!r) return [];
      if (Array.isArray(r) && Array.isArray(r[0])) return r[0];
      if (r.rows) return r.rows;
      return r;
    };

    // get student's room price if exists
    const roomRes = await query(
      `SELECT r.price, s.room_id
       FROM students s
       LEFT JOIN rooms r ON s.room_id = r.room_id
       WHERE s.student_id = $1`,
      [callerStudentId]
    );
    const roomRows = normalize(roomRes);
    const r = roomRows && roomRows[0];
    const price = r?.price ?? null;

    const defaultRent = process.env.RENT_AMOUNT
      ? Number(process.env.RENT_AMOUNT)
      : 1500;
    const amount = Number(req.body.amount ?? price ?? defaultRent);
    const paymentMethod = req.body.payment_method ?? "Online";

    // check already paid for this month
    const existingRes = await query(
      `SELECT 1 FROM payments WHERE student_id = $1 AND month = $2 AND status = 'Paid' LIMIT 1`,
      [callerStudentId, month]
    );
    const existing = normalize(existingRes);
    if (existing && existing.length > 0) {
      return res
        .status(409)
        .json({ message: `Rent already paid for ${month}` });
    }

    // Insert payment and return inserted id
    const insertRes = await query(
      `INSERT INTO payments (student_id, amount, month, status, payment_date, payment_method)
       VALUES ($1, $2, $3, 'Paid', NOW(), $4)
       RETURNING payment_id`,
      [callerStudentId, amount, month, paymentMethod]
    );
    const inserted = normalize(insertRes)[0];

    return res.status(201).json({
      payment_id: inserted?.payment_id ?? null,
      message: `Rent recorded for ${month}`,
      amount,
      month,
      payment_method: paymentMethod,
    });
  } catch (err) {
    console.error("createPaymentByStudent error:", err);
    return res
      .status(500)
      .json({ message: "Server error", detail: err.message });
  }
}

/**
 * GET /api/payments/student/:student_id
 * Returns array of payments for given student (admin and owner can call)
 */
export async function getStudentPayments(req, res) {
  try {
    const student_id = Number(req.params.student_id);
    if (!student_id)
      return res.status(400).json({ message: "Invalid student id" });

    // Optionally: ensure student can only fetch their own payments unless admin
    const caller = req.user;
    if (caller && caller.role !== "admin" && caller.student_id !== student_id) {
      // If token role isn't admin and not the same student -> forbidden
      return res.status(403).json({ message: "Forbidden" });
    }

    const raw = await query(
      `SELECT p.payment_id, p.student_id, p.amount, p.month, p.payment_method, p.payment_date, p.status
       FROM payments p
       WHERE p.student_id = $1
       ORDER BY p.payment_date DESC, p.payment_id DESC
       LIMIT 1000`,
      [student_id]
    );
    const rows =
      Array.isArray(raw) && Array.isArray(raw[0]) ? raw[0] : raw.rows ?? raw;
    return res.json(rows || []);
  } catch (err) {
    console.error("getStudentPayments error:", err);
    return res
      .status(500)
      .json({ message: "Server error", detail: err.message });
  }
}

/* ---- Admin helpers (optional but convenient) ---- */

export async function createPayment(req, res) {
  try {
    const { student_id, amount, month, payment_method } = req.body;
    if (!student_id || !amount || !month)
      return res
        .status(400)
        .json({ message: "student_id, amount and month required" });

    const insertRes = await query(
      `INSERT INTO payments (student_id, amount, month, status, payment_date, payment_method)
       VALUES ($1, $2, $3, 'Paid', NOW(), $4)
       RETURNING payment_id`,
      [student_id, Number(amount), month, payment_method ?? "Admin"]
    );
    const inserted =
      (insertRes.rows && insertRes.rows[0]) ||
      (Array.isArray(insertRes) && insertRes[0]);
    return res.status(201).json({ payment_id: inserted?.payment_id ?? null });
  } catch (err) {
    console.error("createPayment (admin) error:", err);
    return res
      .status(500)
      .json({ message: "Server error", detail: err.message });
  }
}

export async function getAllPayments(req, res) {
  try {
    const raw = await query(
      `SELECT p.payment_id, p.student_id, p.amount, p.month, p.payment_method, p.payment_date, p.status,
              s.first_name, s.last_name, s.email
       FROM payments p
       LEFT JOIN students s ON s.student_id = p.student_id
       ORDER BY p.payment_date DESC
       LIMIT 2000`
    );
    const rows =
      Array.isArray(raw) && Array.isArray(raw[0]) ? raw[0] : raw.rows ?? raw;
    return res.json(rows || []);
  } catch (err) {
    console.error("getAllPayments error:", err);
    return res
      .status(500)
      .json({ message: "Server error", detail: err.message });
  }
}

export async function updatePaymentStatus(req, res) {
  try {
    const payment_id = Number(req.params.payment_id);
    const { status } = req.body;
    if (!["Paid", "Pending", "Cancelled"].includes(status))
      return res.status(400).json({ message: "Invalid status" });

    const updateRes = await query(
      `UPDATE payments SET status = $1 WHERE payment_id = $2`,
      [status, payment_id]
    );

    // rowCount for pg
    if (updateRes.rowCount === 0) {
      return res.status(404).json({ message: "Payment not found" });
    }

    return res.json({ success: true });
  } catch (err) {
    console.error("updatePaymentStatus error:", err);
    return res
      .status(500)
      .json({ message: "Server error", detail: err.message });
  }
}

export async function deletePayment(req, res) {
  try {
    const payment_id = Number(req.params.payment_id);
    const delRes = await query(`DELETE FROM payments WHERE payment_id = $1`, [
      payment_id,
    ]);

    if (delRes.rowCount === 0) {
      return res.status(404).json({ message: "Payment not found" });
    }

    return res.json({ success: true });
  } catch (err) {
    console.error("deletePayment error:", err);
    return res
      .status(500)
      .json({ message: "Server error", detail: err.message });
  }
}
