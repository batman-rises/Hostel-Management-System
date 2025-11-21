// src/pages/Dashboard.jsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";

export default function Dashboard() {
  const { user } = useAuth?.() ?? {};
  const navigate = useNavigate();

  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let mounted = true;
    const fetchStats = async () => {
      if (user?.role !== "admin") return;
      setLoading(true);
      try {
        const res = await api.get("/admin/dashboard");
        if (!mounted) return;
        setStats(res.data);
      } catch (err) {
        console.warn(
          "Dashboard: failed to load admin stats",
          err?.message ?? err
        );
      } finally {
        if (mounted) setLoading(false);
      }
    };
    fetchStats();
    return () => (mounted = false);
  }, [user]);

  // Get time-based greeting
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good Morning";
    if (hour < 17) return "Good Afternoon";
    return "Good Evening";
  };

  const isAdmin = user?.role === "admin";

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      <div className="max-w-[1200px] mx-auto p-6 py-12">
        {/* Welcome Hero Section */}
        <div className="mb-12 text-center">
          <h1 className="text-5xl font-bold text-slate-900 mb-3">
            {getGreeting()}, {user?.name || "Guest"}! 👋
          </h1>
          <p className="text-xl text-slate-600 max-w-2xl mx-auto">
            Welcome to your Hostel Management portal. Everything you need is
            just a click away.
          </p>
        </div>

        {/* Quick Action Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <QuickActionCard
            title="My Room"
            description="View room details and amenities"
            icon="🏠"
            color="bg-gradient-to-br from-blue-500 to-blue-600"
            onClick={() => navigate("/rooms")}
          />
          <QuickActionCard
            title="Payments"
            description="Manage your payments and dues"
            icon="💳"
            color="bg-gradient-to-br from-green-500 to-green-600"
            onClick={() => navigate("/payments")}
          />
          <QuickActionCard
            title="Complaints"
            description="Submit or track complaints"
            icon="📝"
            color="bg-gradient-to-br from-orange-500 to-orange-600"
            onClick={() => navigate("/complaints")}
          />
          <QuickActionCard
            title="Profile"
            description="Update your information"
            icon="👤"
            color="bg-gradient-to-br from-purple-500 to-purple-600"
            onClick={() => navigate("/profile")}
          />
        </div>

        {/* Admin Stats Section - Only for Admins */}
        {isAdmin && (
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-slate-900 mb-6 text-center">
              Admin Overview
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
              <StatCard
                title="Students"
                value={stats?.students ?? "—"}
                loading={loading}
                icon="👥"
              />
              <StatCard
                title="Rooms"
                value={stats?.rooms ?? "—"}
                loading={loading}
                icon="🏢"
              />
              <StatCard
                title="Paid"
                value={stats?.paymentsPaid ?? "—"}
                loading={loading}
                icon="✅"
              />
              <StatCard
                title="Pending"
                value={stats?.paymentsPending ?? "—"}
                loading={loading}
                icon="⏳"
              />
              <StatCard
                title="Open Issues"
                value={stats?.complaintsOpen ?? "—"}
                loading={loading}
                icon="⚠️"
              />
            </div>
          </div>
        )}

        {/* Information Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <InfoCard
            title="Need Help?"
            description="Have questions or facing issues? Our support team is here to help you 24/7."
            action="Contact Support"
            actionColor="bg-blue-600 hover:bg-blue-700"
            onClick={() => navigate("/complaints")}
          />
          <InfoCard
            title="Important Notice"
            description="Remember to pay your monthly dues by the 5th of each month to avoid late fees."
            action="View Payments"
            actionColor="bg-green-600 hover:bg-green-700"
            onClick={() => navigate("/payments")}
          />
        </div>

        {/* Admin Quick Actions - Only for Admins */}
        {isAdmin && (
          <div className="mt-12 bg-white rounded-2xl shadow-lg p-8 border border-slate-200">
            <h3 className="text-xl font-bold text-slate-900 mb-6">
              Admin Quick Actions
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <AdminActionBtn
                title="Manage Students"
                onClick={() => navigate("/admin/students")}
              />
              <AdminActionBtn
                title="Manage Rooms"
                onClick={() => navigate("/rooms")}
              />
              <AdminActionBtn
                title="View Reports"
                onClick={() => navigate("/complaints")}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/* Component Library */

function QuickActionCard({ title, description, icon, color, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`${color} text-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 text-left`}
    >
      <div className="text-4xl mb-3">{icon}</div>
      <h3 className="text-xl font-bold mb-2">{title}</h3>
      <p className="text-sm text-white/90">{description}</p>
    </button>
  );
}

function StatCard({ title, value, loading, icon }) {
  return (
    <div className="bg-white rounded-xl p-6 shadow-md border border-slate-200 hover:shadow-lg transition-shadow">
      <div className="flex items-center justify-between mb-3">
        <div className="text-2xl">{icon}</div>
        <div className="text-xs font-medium text-slate-500 uppercase tracking-wide">
          {title}
        </div>
      </div>
      <div className="text-3xl font-bold text-slate-900">
        {loading ? (
          <div className="h-8 w-16 bg-slate-200 rounded animate-pulse" />
        ) : (
          value
        )}
      </div>
    </div>
  );
}

function InfoCard({ title, description, action, actionColor, onClick }) {
  return (
    <div className="bg-white rounded-2xl p-8 shadow-lg border border-slate-200">
      <h3 className="text-xl font-bold text-slate-900 mb-3">{title}</h3>
      <p className="text-slate-600 mb-6">{description}</p>
      <button
        onClick={onClick}
        className={`${actionColor} text-white px-6 py-3 rounded-lg font-medium transition-colors`}
      >
        {action}
      </button>
    </div>
  );
}

function AdminActionBtn({ title, onClick }) {
  return (
    <button
      onClick={onClick}
      className="bg-slate-50 hover:bg-slate-100 border-2 border-slate-200 rounded-xl p-4 font-medium text-slate-700 transition-colors"
    >
      {title}
    </button>
  );
}
