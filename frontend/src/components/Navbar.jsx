// src/components/Navbar.jsx
import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext"; // named import (matches your AuthContext)

export default function Navbar() {
  const { token, user, logout, loading } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  // role detection: prefer user.role, fallback to localStorage (avoids flicker while loading)
  const role = user?.role || localStorage.getItem("role");

  return (
    <nav className="w-full bg-slate-900 text-white p-4">
      <div className="max-w-6xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-6">
          <Link to="/" className="text-xl font-bold">
            HostelMS
          </Link>

          {/* Public links */}
          <Link to="/rooms" className="hover:underline">
            Rooms
          </Link>
          <Link to="/payments" className="hover:underline">
            Payments
          </Link>
          <Link to="/complaints" className="hover:underline">
            Complaints
          </Link>

          {/* Profile visible when logged */}
          {token && (
            <Link to="/profile" className="hover:underline">
              Profile
            </Link>
          )}

          {/* Admin links */}
          {role === "admin" && (
            <>
              <Link to="/admin" className="hover:underline">
                Admin
              </Link>
              <Link to="/admin/students" className="hover:underline">
                Students
              </Link>
              <Link to="/admin/rooms" className="hover:underline">
                Rooms
              </Link>
            </>
          )}
        </div>

        <div>
          {loading ? (
            <span className="text-sm">Loading...</span>
          ) : token ? (
            <div className="flex items-center gap-3">
              <span className="text-sm">
                {user?.first_name || user?.name || "User"}
              </span>
              <button
                onClick={handleLogout}
                className="bg-blue-600 px-3 py-1 rounded"
              >
                Logout
              </button>
            </div>
          ) : (
            <button
              onClick={() => navigate("/login")}
              className="bg-blue-600 px-3 py-1 rounded"
            >
              Login
            </button>
          )}
        </div>
      </div>
    </nav>
  );
}
