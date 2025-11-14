// src/pages/Rooms.jsx
import React, { useEffect, useState } from "react";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";

export default function Rooms() {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    (async () => {
      try {
        const res = await api.get("/rooms"); // /api/rooms -> getRooms
        setRooms(res.data || []);
      } catch (err) {
        console.error("Rooms fetch:", err);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const bookRoom = async (room_id) => {
    if (!user?.student_id) {
      alert("You must be logged in as a student to book");
      return;
    }
    if (!confirm("Book this room?")) return;
    try {
      const res = await api.post(`/rooms/${room_id}/book`);
      alert(res.data?.message || "Booked");
      // refresh room list
      const r = await api.get("/rooms");
      setRooms(r.data || []);
    } catch (err) {
      console.error("book error:", err);
      alert(err.response?.data?.message || "Booking failed");
    }
  };

  if (loading) return <div className="p-8 text-center">Loading...</div>;

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">Rooms</h2>
      <div className="grid gap-4">
        {rooms.map((r) => {
          const available =
            (r.status || "").toLowerCase() !== "full" &&
            r.occupied < r.capacity;
          return (
            <div
              key={r.room_id}
              className="bg-white rounded p-4 shadow flex justify-between items-center"
            >
              <div>
                <div className="font-semibold">{r.room_number}</div>
                <div className="text-sm">
                  Capacity: {r.capacity} • Occupied: {r.occupants ?? r.occupied}
                </div>
                <div className="text-sm">
                  Status: {r.status || (available ? "Available" : "Full")}
                </div>
              </div>
              <div>
                {available ? (
                  <button
                    onClick={() => bookRoom(r.room_id)}
                    className="bg-green-600 px-3 py-1 rounded text-white"
                  >
                    Book
                  </button>
                ) : (
                  <button
                    disabled
                    className="bg-gray-400 px-3 py-1 rounded text-white"
                  >
                    Full
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
