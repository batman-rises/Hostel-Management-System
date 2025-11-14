// src/components/ProtectedRoute.jsx
import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext"; // named import

/**
 * ProtectedRoute
 * - children : the protected element
 * - role (optional) : if provided, requires the user's role to match (e.g. "admin")
 */
export default function ProtectedRoute({ children, role = null }) {
  const { token, loading, user } = useAuth();

  // while auth state resolving, show small loader so navbar can still show
  if (loading) return <div className="p-6 text-center">Loading...</div>;

  // not logged in -> redirect to login
  if (!token) return <Navigate to="/login" replace />;

  // if role required, ensure user (or localStorage) has it
  if (role) {
    const userRole = user?.role || localStorage.getItem("role");
    if (userRole !== role && userRole !== "admin") {
      // if you only want exactly the role, remove the userRole !== 'admin' fallback
      return <Navigate to="/login" replace />;
    }
  }

  return children;
}
