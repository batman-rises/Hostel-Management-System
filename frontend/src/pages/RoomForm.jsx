import React, { useState } from "react";
import api from "../api/axios";
import { useNavigate } from "react-router-dom";

export default function RoomForm() {
  const [room_number, setNumber] = useState("");
  const [capacity, setCapacity] = useState(2);
  const navigate = useNavigate();

  const submit = async (e) => {
    e.preventDefault();
    try {
      await api.post("/rooms", { room_number, capacity });
      navigate("/rooms");
    } catch (err) {
      alert("Failed to create room");
    }
  };

  return (
    <div className="container py-8">
      <div className="card max-w-md">
        <h2 className="text-xl font-bold mb-4">Add Room</h2>
        <form onSubmit={submit} className="space-y-3">
          <input
            className="w-full border rounded px-3 py-2"
            placeholder="Room number"
            value={room_number}
            onChange={(e) => setNumber(e.target.value)}
          />
          <input
            className="w-full border rounded px-3 py-2"
            placeholder="Capacity"
            type="number"
            value={capacity}
            onChange={(e) => setCapacity(e.target.value)}
          />
          <button className="w-full bg-slate-800 text-white py-2 rounded">
            Create
          </button>
        </form>
      </div>
    </div>
  );
}
