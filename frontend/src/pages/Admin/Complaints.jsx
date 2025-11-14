// src/pages/admin/Complaints.jsx
import React, { useEffect, useState } from "react";
import api from "../../api/axios";

export default function AdminComplaints() {
  const [complaints, setComplaints] = useState([]);

  useEffect(() => {
    (async () => {
      try {
        const res = await api.get("/admin/complaints");
        setComplaints(res.data || []);
      } catch (err) {
        console.error("complaints fetch:", err);
      }
    })();
  }, []);

  const updateStatus = async (id, status) => {
    try {
      await api.put(`/admin/complaints/${id}`, { status });
      setComplaints((c) =>
        c.map((x) => (x.complaint_id === id ? { ...x, status } : x))
      );
    } catch (err) {
      console.error("update complaint:", err);
      alert("Failed to update complaint");
    }
  };

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Complaints</h1>
      <div className="space-y-4">
        {complaints.map((c) => (
          <div key={c.complaint_id} className="bg-white rounded shadow p-4">
            <div className="flex justify-between">
              <div>
                <div className="font-semibold">{c.title}</div>
                <div className="text-sm text-slate-600">
                  By:{" "}
                  {c.first_name
                    ? `${c.first_name} ${c.last_name}`
                    : `#${c.student_id}`}
                </div>
                <div className="mt-2">{c.details}</div>
              </div>
              <div className="text-right">
                <div className="mb-2">
                  {c.created_at ? new Date(c.created_at).toLocaleString() : ""}
                </div>
                <select
                  value={c.status}
                  onChange={(e) => updateStatus(c.complaint_id, e.target.value)}
                >
                  <option value="Pending">Pending</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Resolved">Resolved</option>
                </select>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
