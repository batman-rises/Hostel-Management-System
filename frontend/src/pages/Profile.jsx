// src/pages/Profile.jsx
import React, { useContext, useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import api from "../api/axios";

export default function Profile() {
  const { user, loading, reload } = useAuth();
  const [form, setForm] = useState({
    first_name: "",
    last_name: "",
    phone: "",
    gender: "",
    password: "",
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (user)
      setForm({
        first_name: user.first_name || "",
        last_name: user.last_name || "",
        phone: user.phone || "",
        gender: user.gender || "",
        password: "",
      });
  }, [user]);

  const submit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const body = {
        first_name: form.first_name,
        last_name: form.last_name,
        phone: form.phone,
        gender: form.gender,
      };
      if (form.password) body.password = form.password;
      const res = await api.put("/students/me", body);
      alert("Profile updated");
      await reload(); // refresh auth context profile
    } catch (err) {
      console.error("update profile:", err);
      alert(err.response?.data?.message || "Failed");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="p-8 text-center">Loading...</div>;
  if (!user) return <div className="p-8 text-center">Not logged in</div>;

  return (
    <div className="p-8 max-w-3xl mx-auto">
      <h2 className="text-2xl font-semibold mb-4">Edit Profile</h2>
      <form onSubmit={submit} className="bg-white rounded shadow p-6 space-y-3">
        <div>
          <label className="block text-sm">First name</label>
          <input
            value={form.first_name}
            onChange={(e) => setForm({ ...form, first_name: e.target.value })}
            className="w-full border rounded px-3 py-2"
          />
        </div>
        <div>
          <label className="block text-sm">Last name</label>
          <input
            value={form.last_name}
            onChange={(e) => setForm({ ...form, last_name: e.target.value })}
            className="w-full border rounded px-3 py-2"
          />
        </div>
        <div>
          <label className="block text-sm">Phone</label>
          <input
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
            className="w-full border rounded px-3 py-2"
          />
        </div>
        <div>
          <label className="block text-sm">Gender</label>
          <input
            value={form.gender}
            onChange={(e) => setForm({ ...form, gender: e.target.value })}
            className="w-full border rounded px-3 py-2"
          />
        </div>
        <div>
          <label className="block text-sm">
            New password (leave empty to keep)
          </label>
          <input
            type="password"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            className="w-full border rounded px-3 py-2"
          />
        </div>
        <div>
          <button
            disabled={saving}
            className="bg-blue-600 text-white px-4 py-2 rounded"
          >
            {saving ? "Saving..." : "Save profile"}
          </button>
        </div>
      </form>
    </div>
  );
}
