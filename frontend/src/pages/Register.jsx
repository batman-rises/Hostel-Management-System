import React, { useState } from "react";
import api from "../api/axios";
import { useNavigate } from "react-router-dom";

export default function Register() {
  const [first_name, setFirst] = useState("");
  const [last_name, setLast] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [gender, setGender] = useState("Male");
  const navigate = useNavigate();

  const handle = async (e) => {
    e.preventDefault();
    try {
      console.log("AXIOS baseURL =", api.defaults.baseURL);

      await api.post("/student/register", {
        first_name,
        last_name,
        email,
        password,
        phone,
        gender,
      });
      alert("Registered. Please login.");
      navigate("/login");
    } catch (err) {
      alert(err.response?.data?.message || "Registration failed");
    }
  };

  return (
    <div className="min-h-[70vh] flex items-center justify-center">
      <div className="card w-full max-w-md">
        <h2 className="text-2xl font-bold mb-4">Register</h2>
        <form onSubmit={handle} className="space-y-3">
          <input
            className="w-full border rounded px-3 py-2"
            placeholder="First name"
            value={first_name}
            onChange={(e) => setFirst(e.target.value)}
          />
          <input
            className="w-full border rounded px-3 py-2"
            placeholder="Last name"
            value={last_name}
            onChange={(e) => setLast(e.target.value)}
          />
          <input
            className="w-full border rounded px-3 py-2"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <input
            className="w-full border rounded px-3 py-2"
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <input
            className="w-full border rounded px-3 py-2"
            placeholder="Phone"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />
          <select
            className="w-full border rounded px-3 py-2"
            value={gender}
            onChange={(e) => setGender(e.target.value)}
          >
            <option>Male</option>
            <option>Female</option>
            <option>Other</option>
          </select>
          <button className="w-full bg-slate-800 text-white py-2 rounded">
            Register
          </button>
        </form>
      </div>
    </div>
  );
}
