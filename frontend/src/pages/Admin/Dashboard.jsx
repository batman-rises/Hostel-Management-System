// src/pages/Admin/Dashboard.jsx
import React, { useEffect, useState } from "react";
import api from "../../api/axios";
import { useAuth } from "../../context/AuthContext"; // Fixed: Added curly braces

export default function AdminDashboard() {
  const { token } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setLoading(true);
        const res = await api.get("/admin/dashboard");
        if (mounted) {
          setData(res.data);
          setError(null);
        }
      } catch (err) {
        console.error("Dashboard load:", err);
        if (mounted) {
          setError(err.response?.data?.message || "Failed to load dashboard");
        }
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => (mounted = false);
  }, [token]);

  if (loading) return <div className="p-8 text-center">Loading...</div>;
  if (error) return <div className="p-8 text-center text-red-600">{error}</div>;
  if (!data) return <div className="p-8 text-center">No data available</div>;

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Admin Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-sm text-gray-600 mb-2">Total Students</div>
          <div className="text-3xl font-bold text-slate-800">
            {data.students || 0}
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-sm text-gray-600 mb-2">Total Rooms</div>
          <div className="text-3xl font-bold text-slate-800">
            {data.rooms || 0}
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-sm text-gray-600 mb-2">Payments Paid</div>
          <div className="text-3xl font-bold text-green-600">
            {data.paymentsPaid || 0}
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-sm text-gray-600 mb-2">Open Complaints</div>
          <div className="text-3xl font-bold text-orange-600">
            {data.complaintsOpen || 0}
          </div>
        </div>
      </div>

      <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4">Quick Actions</h2>
          <div className="space-y-2">
            <a
              href="/admin/students"
              className="block px-4 py-2 bg-slate-100 hover:bg-slate-200 rounded"
            >
              Manage Students
            </a>
            <a
              href="/admin/rooms"
              className="block px-4 py-2 bg-slate-100 hover:bg-slate-200 rounded"
            >
              Manage Rooms
            </a>
            <a
              href="/admin/payments"
              className="block px-4 py-2 bg-slate-100 hover:bg-slate-200 rounded"
            >
              View Payments
            </a>
            <a
              href="/admin/complaints"
              className="block px-4 py-2 bg-slate-100 hover:bg-slate-200 rounded"
            >
              Handle Complaints
            </a>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4">System Status</h2>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">Pending Payments:</span>
              <span className="font-semibold">{data.paymentsPending || 0}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Active Complaints:</span>
              <span className="font-semibold">{data.complaintsOpen || 0}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Total Occupancy:</span>
              <span className="font-semibold">
                {data.students || 0} / {data.rooms ? data.rooms * 2 : 0}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
