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
        // swallow — admin-only data; don't break UI
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

  const s = stats ?? {
    students: "—",
    rooms: "—",
    paymentsPaid: "—",
    paymentsPending: "—",
    complaintsOpen: "—",
  };

  return (
    <div className="max-w-[1200px] mx-auto p-6">
      {/* Top header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-4xl font-extrabold text-slate-900">Dashboard</h1>
          <p className="mt-2 text-slate-500 max-w-xl">
            Welcome to the Hostel Management System — quick overview and useful
            shortcuts.
          </p>
        </div>

        <div className="flex gap-3 items-center">
          <button
            onClick={() => navigate("/rooms")}
            className="hidden sm:inline-flex items-center px-4 py-2 border rounded bg-white text-sm shadow-sm hover:shadow-md"
          >
            Browse Rooms
          </button>
          <button
            onClick={() => navigate("/payments")}
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
          >
            Payments
          </button>
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard
          title="Students"
          hint="Total registered"
          value={s.students}
          loading={loading}
        />
        <StatCard
          title="Rooms"
          hint="Total rooms"
          value={s.rooms}
          loading={loading}
        />
        <StatCard
          title="Payments (Paid)"
          hint="Recorded as paid"
          value={s.paymentsPaid}
          loading={loading}
        />
        <StatCard
          title="Open complaints"
          hint="Unresolved"
          value={s.complaintsOpen}
          loading={loading}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-lg shadow-sm p-6 border border-slate-100">
          <h2 className="text-lg font-semibold mb-3">Recent actions</h2>
          <p className="text-sm text-slate-600 mb-6">
            Quick access to pages you use most. Click any card to open the page.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <ActionCard
              title="Payments"
              subtitle="View all payments"
              onClick={() => navigate("/payments")}
            />
            <ActionCard
              title="Complaints"
              subtitle="Manage complaints"
              onClick={() => navigate("/complaints")}
            />
            <ActionCard
              title="Students"
              subtitle="Student list"
              onClick={() => navigate("/admin/students")}
            />
          </div>

          <div className="mt-6 text-sm text-slate-500">
            Tip: Admins can manage rooms and mark complaints/resolutions from
            the admin area.
          </div>
        </div>

        <aside className="bg-white rounded-lg shadow-sm p-6 border border-slate-100">
          <h3 className="text-lg font-semibold mb-3">Quick summary</h3>
          <div className="space-y-4 text-sm text-slate-700">
            <SummaryLine
              label="Available"
              value={s.rooms !== "—" ? "See rooms" : "—"}
              actionText="Browse"
              onClick={() => navigate("/rooms")}
            />
            <SummaryLine
              label="Pending payments"
              value={s.paymentsPending ?? "—"}
              actionText="Pay"
              onClick={() => navigate("/payments")}
            />
            <SummaryLine label="Open complaints" value={s.complaintsOpen} />
          </div>
        </aside>
      </div>
    </div>
  );
}

/* small presentational pieces */

function StatCard({ title, hint, value, loading }) {
  return (
    <div className="bg-white rounded-lg p-4 shadow-sm border border-slate-100 flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between">
          <div className="text-sm font-medium text-slate-600">{title}</div>
          <div className="text-xs text-slate-400">{hint}</div>
        </div>

        <div className="mt-4 flex items-end gap-3">
          <div className="text-3xl font-semibold text-slate-900">
            {loading ? (
              <div className="h-8 w-20 bg-slate-200 rounded animate-pulse" />
            ) : (
              value
            )}
          </div>
          <div className="text-xs text-slate-400">updated</div>
        </div>
      </div>
      <div className="mt-4 text-xs text-slate-400">
        Updated: {new Date().toLocaleString()}
      </div>
    </div>
  );
}

function ActionCard({ title, subtitle, onClick }) {
  return (
    <button
      onClick={onClick}
      className="w-full text-left p-4 bg-slate-50 rounded border border-slate-100 hover:shadow-sm transition"
    >
      <div className="text-sm font-medium text-slate-800">{title}</div>
      <div className="text-xs text-slate-500 mt-1">{subtitle}</div>
    </button>
  );
}

function SummaryLine({ label, value, actionText, onClick }) {
  return (
    <div className="flex items-center justify-between">
      <div>
        <div className="text-xs text-slate-500">{label}</div>
        <div className="font-medium text-slate-800">{value}</div>
      </div>
      {actionText ? (
        <button
          onClick={onClick}
          className="px-3 py-1 bg-green-600 text-white rounded text-sm"
        >
          {actionText}
        </button>
      ) : null}
    </div>
  );
}
