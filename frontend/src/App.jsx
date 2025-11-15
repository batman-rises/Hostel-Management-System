// src/App.jsx - Fixed with proper role-based routing
import React from "react";
import { Routes, Route, useLocation, Navigate } from "react-router-dom";
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
import { useAuth } from "./context/AuthContext"; // Import your auth context

export default function App() {
  const location = useLocation();
  const { user } = useAuth(); // Get current user to check role

  // Hide navbar for landing page
  const hideNavbarOn = ["/", "/login", "/register"];
  const shouldHideNavbar = hideNavbarOn.includes(location.pathname);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {!shouldHideNavbar && <Navbar />}

      <main className="flex-grow">
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

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

          {/* Student routes */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
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
            path="/profile"
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            }
          />

          {/* Complaints route - redirects based on role */}
          <Route
            path="/complaints"
            element={
              <ProtectedRoute>
                {user?.role === "admin" ? (
                  <Navigate to="/admin/complaints" replace />
                ) : (
                  <Complaints />
                )}
              </ProtectedRoute>
            }
          />

          {/* 404 */}
          <Route
            path="*"
            element={
              <div className="p-8 text-center">
                <h1 className="text-2xl font-bold">404 - Page not found</h1>
                <p className="mt-2">
                  The page you're looking for doesn't exist.
                </p>
              </div>
            }
          />
        </Routes>
      </main>
    </div>
  );
}
