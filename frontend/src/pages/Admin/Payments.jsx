// src/pages/admin/Payments.jsx
import React, { useEffect, useState } from "react";
import api from "../../api/axios";

export default function AdminPayments() {
  const [payments, setPayments] = useState([]);

  useEffect(() => {
    (async () => {
      try {
        const res = await api.get("/admin/payments");
        setPayments(res.data || []);
      } catch (err) {
        console.error("Payments fetch:", err);
      }
    })();
  }, []);

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Payments</h1>
      <div className="bg-white rounded shadow overflow-auto">
        <table className="w-full">
          <thead>
            <tr>
              <th className="p-2 text-left">ID</th>
              <th className="p-2 text-left">Student</th>
              <th className="p-2 text-left">Amount</th>
              <th className="p-2 text-left">Month</th>
              <th className="p-2 text-left">Method</th>
              <th className="p-2 text-left">Date</th>
              <th className="p-2 text-left">Status</th>
            </tr>
          </thead>
          <tbody>
            {payments.map((p) => (
              <tr key={p.payment_id} className="odd:bg-slate-50">
                <td className="p-2">{p.payment_id}</td>
                <td className="p-2">
                  {p.first_name
                    ? `${p.first_name} ${p.last_name}`
                    : `#${p.student_id}`}
                </td>
                <td className="p-2">₹{p.amount}</td>
                <td className="p-2">{p.month}</td>
                <td className="p-2">{p.payment_method}</td>
                <td className="p-2">
                  {p.payment_date
                    ? new Date(p.payment_date).toLocaleString()
                    : "-"}
                </td>
                <td className="p-2">{p.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
