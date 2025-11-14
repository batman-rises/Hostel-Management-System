// backend/routes/room.route.js
import express from "express";
import {
  addRoom,
  getRooms,
  updateRoom,
  deleteRoom,
  bookRoom,
} from "../controllers/room.controller.js";
import { authenticateToken } from "../middleware/auth.js";

const router = express.Router();

// admin-only create room
router.post("/", authenticateToken("admin"), addRoom);

// list rooms (authenticated - both admin and student can call)
router.get("/", authenticateToken(), getRooms);

// update/delete (admin)
router.put("/:id", authenticateToken("admin"), updateRoom);
router.delete("/:id", authenticateToken("admin"), deleteRoom);

// BOOK a room (student or admin can call; uses token to get student id)
router.post("/:room_id/book", authenticateToken(), bookRoom);

export default router;
