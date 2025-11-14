// backend/routes/admin.route.js
import express from "express";
import {
  getDashboard,
  getStudents,
  getRooms,
  updateRoomStatus,
  getPayments,
  getComplaints,
  updateComplaintStatus,
  getProfile,
  registerAdmin,
  loginAdmin,
} from "../controllers/admin.controller.js";

import { authenticateToken } from "../middleware/auth.js";

const router = express.Router();

// public admin auth endpoints
router.post("/register", registerAdmin);
router.post("/login", loginAdmin);

// protected admin profile
router.get("/me", authenticateToken("admin"), getProfile);

// admin-only endpoints
router.get("/dashboard", authenticateToken("admin"), getDashboard);
router.get("/students", authenticateToken("admin"), getStudents);
router.get("/rooms", authenticateToken("admin"), getRooms);
router.put("/rooms/:room_id", authenticateToken("admin"), updateRoomStatus);
router.get("/payments", authenticateToken("admin"), getPayments);
router.get("/complaints", authenticateToken("admin"), getComplaints);
router.put(
  "/complaints/:complaint_id",
  authenticateToken("admin"),
  updateComplaintStatus
);

export default router;
