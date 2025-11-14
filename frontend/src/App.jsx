// src/App.jsx
import React from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import Navbar from "./components/Navbar";

import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Rooms from "./pages/Rooms";
import RoomForm from "./pages/RoomForm";
import Payments from "./pages/Payments";
import Complaints from "./pages/Complaints";
import Profile from "./pages/Profile";
import ProtectedRoute from "./components/ProtectedRoute";
import LandingPage from "./pages/LandingPage";

import AdminDashboard from "./pages/Admin/Dashboard";
import AdminStudents from "./pages/Admin/Student";
import AdminRooms from "./pages/Admin/Rooms";
import AdminPayments from "./pages/Admin/Payments";
import AdminComplaints from "./pages/Admin/Complaints";

export default function App() {
  const location = useLocation();

  // Hide navbar for landing page. Add more paths to hide as needed.
  const hideNavbarOn = ["/"]; // e.g. ["/", "/login", "/register"]
  const shouldHideNavbar = hideNavbarOn.includes(location.pathname);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {!shouldHideNavbar && <Navbar />}

      <main className="flex-grow">
        <Routes>
          {/* Admin routes */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute role="admin">
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/students"
            element={
              <ProtectedRoute role="admin">
                <AdminStudents />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/rooms"
            element={
              <ProtectedRoute role="admin">
                <AdminRooms />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/payments"
            element={
              <ProtectedRoute role="admin">
                <AdminPayments />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/complaints"
            element={
              <ProtectedRoute role="admin">
                <AdminComplaints />
              </ProtectedRoute>
            }
          />

          {/* Public / student routes */}
          <Route path="/" element={<LandingPage />} />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          <Route
            path="/rooms"
            element={
              <ProtectedRoute>
                <Rooms />
              </ProtectedRoute>
            }
          />
          <Route
            path="/rooms/new"
            element={
              <ProtectedRoute role="admin">
                <RoomForm />
              </ProtectedRoute>
            }
          />
          <Route
            path="/payments"
            element={
              <ProtectedRoute>
                <Payments />
              </ProtectedRoute>
            }
          />
          <Route
            path="/complaints"
            element={
              <ProtectedRoute>
                <Complaints />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            }
          />

          <Route path="*" element={<div className="p-8">Page not found</div>} />
        </Routes>
      </main>
    </div>
  );
}
