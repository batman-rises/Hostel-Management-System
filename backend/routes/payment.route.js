// backend/routes/payment.route.js
import express from "express";
import {
  createPaymentByStudent,
  createPayment,
  getAllPayments,
  getStudentPayments,
  updatePaymentStatus,
  deletePayment,
} from "../controllers/payment.controller.js";

import { authenticateToken } from "../middleware/auth.js";

const router = express.Router();

// Admin creates new payment record
router.post("/", authenticateToken("admin"), createPayment);

// Student creates a payment (student or admin)
router.post("/pay", authenticateToken(), createPaymentByStudent);

// Admin views all payments
router.get("/", authenticateToken("admin"), getAllPayments);

// Student or Admin views specific student's payments
router.get("/student/:student_id", authenticateToken(), getStudentPayments);

// Admin updates payment status
router.put("/:payment_id", authenticateToken("admin"), updatePaymentStatus);

// Admin deletes a payment record
router.delete("/:payment_id", authenticateToken("admin"), deletePayment);

export default router;
