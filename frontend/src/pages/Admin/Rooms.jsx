// src/pages/admin/Rooms.jsx
import React, { useEffect, useState } from "react";
import api from "../../api/axios";

export default function AdminRooms() {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const res = await api.get("/admin/rooms");
        setRooms(res.data || []);
      } catch (err) {
        console.error("Rooms fetch:", err);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const updateStatus = async (room_id, status) => {
    try {
      await api.put(`/admin/rooms/${room_id}`, { status });
      setRooms((r) =>
        r.map((x) => (x.room_id === room_id ? { ...x, status } : x))
      );
    } catch (err) {
      console.error("update room:", err);
      alert("Failed to update room");
    }
  };

  if (loading) return <div className="p-8 text-center">Loading...</div>;

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Rooms</h1>
      <div className="space-y-3">
        {rooms.map((r) => (
          <div
            key={r.room_id}
            className="bg-white p-4 rounded shadow flex justify-between items-center"
          >
            <div>
              <div className="font-semibold">{r.room_number}</div>
              <div className="text-sm">
                Capacity: {r.capacity} • Occupants: {r.occupants}
              </div>
            </div>
            <div className="flex gap-2 items-center">
              <div className="text-sm">{r.status}</div>
              <select
                value={r.status}
                onChange={(e) => updateStatus(r.room_id, e.target.value)}
              >
                <option value="Available">Available</option>
                <option value="Full">Full</option>
                <option value="maintenance">maintenance</option>
              </select>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
