// backend/server.js

import express from "express";
import cors from "cors";
import dotenv from "dotenv";
dotenv.config();

// Import routes
import studentRoutes from "./routes/student.route.js";
import roomRoutes from "./routes/room.route.js";
import complaintRoutes from "./routes/complaint.route.js";
import adminRoutes from "./routes/admin.route.js";
import paymentRoutes from "./routes/payment.route.js";

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Request Logger (to see all incoming requests)
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`);
  next();
});

// Debug route
app.get("/api/ping", (req, res) => {
  res.json({ ok: true, time: new Date().toISOString() });
});
// temporary debug route - add below /api/ping
app.post("/api/_test_book_endpoint", (req, res) => {
  console.log(
    "DEBUG: /api/_test_book_endpoint hit",
    req.method,
    req.originalUrl,
    "auth:",
    req.headers.authorization
  );
  res.json({ ok: true, msg: "debug hit" });
});

// Mount routes — IMPORTANT: Accept both singular & plural
app.use("/api/student", studentRoutes);
app.use("/api/students", studentRoutes);

app.use("/api/rooms", roomRoutes);
app.use("/api/complaints", complaintRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/payments", paymentRoutes);

// PORT + HOST

const PORT = process.env.PORT || 5000;
const HOST = process.env.HOST || "127.0.0.1";

app.listen(PORT, HOST, () =>
  console.log(`Server running at http://${HOST}:${PORT}`)
);
