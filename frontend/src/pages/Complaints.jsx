// src/pages/Complaints.jsx
import React, { useEffect, useState } from "react";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";

export default function Complaints() {
  const { user } = useAuth();
  const [complaints, setComplaints] = useState([]);
  const [form, setForm] = useState({ title: "", description: "" });

  const load = async () => {
    try {
      const res = await api.get("/complaints");
      setComplaints(res.data || []);
    } catch (err) {
      console.error("complaints fetch:", err);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const raise = async (e) => {
    e.preventDefault();
    if (!form.title || !form.description)
      return alert("Title & description required");
    try {
      await api.post("/complaints", {
        title: form.title,
        description: form.description,
        student_id: user?.student_id,
      });
      alert("Complaint submitted");
      setForm({ title: "", description: "" });
      load();
    } catch (err) {
      console.error("raise complaint:", err);
      alert(err.response?.data?.message || "Failed");
    }
  };

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">Complaints</h2>

      <div className="bg-white p-4 rounded shadow mb-6">
        <form onSubmit={raise} className="space-y-3">
          <input
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            placeholder="Title"
            className="w-full border rounded px-3 py-2"
          />
          <textarea
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            placeholder="Describe the issue"
            className="w-full border rounded px-3 py-2"
            rows={4}
          />
          <div>
            <button className="bg-blue-600 text-white px-4 py-2 rounded">
              Submit Complaint
            </button>
          </div>
        </form>
      </div>

      <div className="space-y-4">
        {complaints.map((c) => (
          <div key={c.complaint_id} className="bg-white p-4 rounded shadow">
            <div className="flex justify-between">
              <div>
                <div className="font-semibold">{c.title}</div>
                <div className="text-sm text-slate-600">
                  By:{" "}
                  {c.first_name
                    ? `${c.first_name} ${c.last_name}`
                    : `#${c.student_id}`}
                </div>
                <div className="mt-2">{c.description}</div>
              </div>
              <div className="text-right">
                <div className="mb-2">
                  {c.created_at ? new Date(c.created_at).toLocaleString() : ""}
                </div>
                <div
                  className={`text-sm ${
                    c.status === "Resolved"
                      ? "text-green-600"
                      : "text-orange-600"
                  }`}
                >
                  {c.status}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
