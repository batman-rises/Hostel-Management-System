// backend/routes/student.route.js
import express from "express";
import {
  registerStudent,
  loginStudent,
  getProfile,
} from "../controllers/student.controller.js";
import { authenticateToken } from "../middleware/auth.js";
const router = express.Router();

router.post("/register", registerStudent);
router.post("/login", loginStudent);
router.get("/me", authenticateToken, getProfile);

export default router;
