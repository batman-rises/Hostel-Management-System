// src/pages/admin/Students.jsx
import React, { useEffect, useState } from "react";
import api from "../../api/axios";

export default function AdminStudents() {
  const [students, setStudents] = useState([]);

  useEffect(() => {
    (async () => {
      try {
        const res = await api.get("/admin/students");
        setStudents(res.data || []);
      } catch (err) {
        console.error("Students fetch:", err);
      }
    })();
  }, []);

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Students</h1>
      <div className="bg-white rounded shadow overflow-auto">
        <table className="w-full">
          <thead>
            <tr>
              <th className="p-2 text-left">ID</th>
              <th className="p-2 text-left">Name</th>
              <th className="p-2 text-left">Email</th>
              <th className="p-2 text-left">Phone</th>
              <th className="p-2 text-left">Room</th>
              <th className="p-2 text-left">Joined</th>
            </tr>
          </thead>
          <tbody>
            {students.map((s) => (
              <tr key={s.student_id} className="odd:bg-slate-50">
                <td className="p-2">{s.student_id}</td>
                <td className="p-2">
                  {s.first_name} {s.last_name}
                </td>
                <td className="p-2">{s.email}</td>
                <td className="p-2">{s.phone || "-"}</td>
                <td className="p-2">{s.room_id || "-"}</td>
                <td className="p-2">
                  {s.date_of_joining
                    ? new Date(s.date_of_joining).toLocaleDateString()
                    : "-"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
