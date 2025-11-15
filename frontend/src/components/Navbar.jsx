// src/components/Navbar.jsx - Fixed with role-based complaints link
import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Navbar() {
  const { token, user, logout, loading } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  // Role detection: prefer user.role, fallback to localStorage
  const role = user?.role || localStorage.getItem("role");

  // Determine complaints link based on role
  const complaintsLink = role === "admin" ? "/admin/complaints" : "/complaints";

  return (
    <nav className="w-full bg-slate-900 text-white p-4">
      <div className="max-w-6xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-6">
          <Link to="/" className="text-xl font-bold">
            HostelMS
          </Link>

          {/* Show different links based on role */}
          {role === "admin" ? (
            <>
              {/* Admin Navigation */}
              <Link to="/admin" className="hover:underline">
                Dashboard
              </Link>
              <Link to="/admin/students" className="hover:underline">
                Students
              </Link>
              <Link to="/admin/rooms" className="hover:underline">
                Rooms
              </Link>
              <Link to="/admin/payments" className="hover:underline">
                Payments
              </Link>
              <Link to="/admin/complaints" className="hover:underline">
                Complaints
              </Link>
            </>
          ) : (
            <>
              {/* Student Navigation */}
              <Link to="/rooms" className="hover:underline">
                Rooms
              </Link>
              <Link to="/payments" className="hover:underline">
                Payments
              </Link>
              <Link to="/complaints" className="hover:underline">
                Complaints
              </Link>
              {token && (
                <Link to="/profile" className="hover:underline">
                  Profile
                </Link>
              )}
            </>
          )}
        </div>

        <div>
          {loading ? (
            <span className="text-sm">Loading...</span>
          ) : token ? (
            <div className="flex items-center gap-3">
              <span className="text-sm">
                {role === "admin" && "Super Admin"}
                {role === "student" && (user?.first_name || "Student")}
                {!role && (user?.first_name || user?.name || "User")}
              </span>
              <button
                onClick={handleLogout}
                className="bg-blue-600 hover:bg-blue-700 px-3 py-1 rounded transition"
              >
                Logout
              </button>
            </div>
          ) : (
            <button
              onClick={() => navigate("/login")}
              className="bg-blue-600 hover:bg-blue-700 px-3 py-1 rounded transition"
            >
              Login
            </button>
          )}
        </div>
      </div>
    </nav>
  );
}
