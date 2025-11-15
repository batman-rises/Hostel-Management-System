// backend/server.js - Fixed for Express 5 + PostgreSQL

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

// --- CORS setup ------------------------------------------------------------
const allowedOrigins = [
  "http://localhost:5173",
  "http://127.0.0.1:5173",
  // Add your deployed frontend origins here:
  "https://hostel-management-system-frontend-production.up.railway.app",
  // For Vercel deployment (add your Vercel URL):
  process.env.FRONTEND_URL,
].filter(Boolean); // Remove undefined values

const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like curl, Postman, or server-to-server)
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.log("CORS blocked origin:", origin);
      callback(null, true); // For development, allow all. Change to false in production
    }
  },
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "Accept"],
  credentials: true,
  maxAge: 86400,
};

// CORS middleware - must come BEFORE routes
app.use(cors(corsOptions));

// Handle preflight requests for all routes
app.use((req, res, next) => {
  if (req.method === "OPTIONS") {
    res.header("Access-Control-Allow-Origin", req.headers.origin || "*");
    res.header(
      "Access-Control-Allow-Methods",
      "GET,POST,PUT,PATCH,DELETE,OPTIONS"
    );
    res.header(
      "Access-Control-Allow-Headers",
      "Content-Type, Authorization, Accept"
    );
    res.header("Access-Control-Allow-Credentials", "true");
    return res.sendStatus(200);
  }
  next();
});

// --- Body parser ----------------------------------------------------------
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// --- Request Logger -------------------------------------------------------
if (process.env.NODE_ENV !== "production") {
  app.use((req, res, next) => {
    console.log(
      `[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`
    );
    next();
  });
}

// --- Root endpoint --------------------------------------------------------
app.get("/", (req, res) => {
  res.json({
    status: "ok",
    message: "Hostel Management System API",
    version: "1.0.0",
    timestamp: new Date().toISOString(),
  });
});

// --- Debug routes ---------------------------------------------------------
app.get("/api/ping", (req, res) => {
  res.json({ ok: true, time: new Date().toISOString() });
});

// Temporary debug endpoint (remove in production)
if (process.env.NODE_ENV !== "production") {
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
}

// --- Mount application routes ---------------------------------------------
app.use("/api/student", studentRoutes);
app.use("/api/students", studentRoutes);
app.use("/api/rooms", roomRoutes);
app.use("/api/complaints", complaintRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/payments", paymentRoutes);

// --- 404 handler ----------------------------------------------------------
app.use((req, res) => {
  res.status(404).json({
    error: "Not Found",
    message: `Cannot ${req.method} ${req.originalUrl}`,
    availableRoutes: [
      "GET /api/ping",
      "POST /api/admin/login",
      "POST /api/students/register",
      "GET /api/rooms",
      "POST /api/payments/pay",
      "POST /api/complaints",
    ],
  });
});

// --- Error handler --------------------------------------------------------
app.use((err, req, res, next) => {
  console.error("Error:", err);
  res.status(err.status || 500).json({
    error: err.message || "Internal Server Error",
    ...(process.env.NODE_ENV !== "production" && { stack: err.stack }),
  });
});

// --- Start server ---------------------------------------------------------
const PORT = process.env.PORT || 5000;
const HOST = process.env.HOST || "0.0.0.0"; // Changed to 0.0.0.0 for Render deployment

const server = app.listen(PORT, HOST, () => {
  console.log(`
🚀 Server is running!
📡 URL: http://${HOST}:${PORT}
🌍 Environment: ${process.env.NODE_ENV || "development"}
🗄️  Database: PostgreSQL
  `);
});

// Graceful shutdown
process.on("SIGTERM", () => {
  console.log("SIGTERM signal received: closing HTTP server");
  server.close(() => {
    console.log("HTTP server closed");
  });
});

export default app;
