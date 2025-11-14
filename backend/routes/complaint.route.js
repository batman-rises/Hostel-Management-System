import express from "express";
import {
  createComplaint,
  getAllComplaints,
  resolveComplaint,
} from "../controllers/complaint.controller.js";

const router = express.Router();

router.post("/", createComplaint);
router.get("/", getAllComplaints);
router.put("/:id/resolve", resolveComplaint);

export default router;
