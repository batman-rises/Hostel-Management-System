// src/context/AuthContext.jsx
import React, { createContext, useEffect, useState } from "react";
import api from "../api/axios";
import { useNavigate } from "react-router-dom";

export const AuthContext = createContext();

export function AuthProvider({ children }) {
  const navigate = useNavigate();
  const [token, setToken] = useState(localStorage.getItem("token") || null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(Boolean(token));

  const loadProfile = async () => {
    if (!token) {
      setUser(null);
      setLoading(false);
      return;
    }

    setLoading(true);

    try {
      const role = localStorage.getItem("role") || "student";

      // Updated path to match backend routes
      const path = role === "admin" ? "/admin/me" : "/students/me";

      const res = await api.get(path);
      setUser(res.data);

      // store ID and role
      if (role === "student" && res.data?.student_id) {
        localStorage.setItem("id", String(res.data.student_id));
        localStorage.setItem("role", "student");
      }
      if (role === "admin" && res.data?.admin_id) {
        localStorage.setItem("id", String(res.data.admin_id));
        localStorage.setItem("role", "admin");
      }
    } catch (err) {
      console.error("Failed to load profile:", {
        message: err.message,
        code: err.code,
        responseStatus: err.response?.status,
        responseData: err.response?.data,
        endpoint: err.config?.url,
      });

      // Only clear auth if it's an authentication error (401/403)
      if (err.response?.status === 401 || err.response?.status === 403) {
        setUser(null);
        setToken(null);
        localStorage.clear();
        navigate("/login");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      localStorage.setItem("token", token);
      api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
      loadProfile();
    } else {
      localStorage.removeItem("token");
      localStorage.removeItem("id");
      localStorage.removeItem("role");
      delete api.defaults.headers.common["Authorization"];
      setUser(null);
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  /**
   * login helper which calls backend, sets token and returns response
   * usage: await login({ path: '/admin/login', body: { email, password } })
   */
  const login = async ({ path, body }) => {
    const res = await api.post(path, body);
    const newToken = res.data?.token;

    if (newToken) {
      // Set role BEFORE setting token (so loadProfile uses correct role)
      if (res.data.admin) {
        localStorage.setItem("role", "admin");
        localStorage.setItem("id", String(res.data.admin.admin_id));
      } else if (res.data.student) {
        localStorage.setItem("role", "student");
        localStorage.setItem("id", String(res.data.student.student_id));
      } else {
        // Fallback: detect role from path
        const role = path.includes("/admin/") ? "admin" : "student";
        localStorage.setItem("role", role);
      }

      // Set token last (this triggers loadProfile useEffect)
      setToken(newToken);
    }

    return res;
  };

  const logout = () => {
    setToken(null);
    localStorage.removeItem("role");
    localStorage.removeItem("id");
    navigate("/login");
  };

  return (
    <AuthContext.Provider
      value={{ token, user, loading, login, logout, reload: loadProfile }}
    >
      {children}
    </AuthContext.Provider>
  );
}

/** hook helper */
export function useAuth() {
  return React.useContext(AuthContext);
}

export default AuthContext;
