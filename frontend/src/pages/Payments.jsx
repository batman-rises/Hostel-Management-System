// src/pages/Payments.jsx
import React, { useEffect, useState } from "react";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";

export default function Payments() {
  const { user } = useAuth();
  const studentId = user?.student_id;

  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [paying, setPaying] = useState(false);
  const [error, setError] = useState(null);

  // helper: current month string "YYYY-MM"
  const currentMonthStr = (() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(
      2,
      "0"
    )}`;
  })();

  useEffect(() => {
    if (!studentId) {
      setLoading(false);
      return;
    }
    let mounted = true;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await api.get(`/payments/student/${studentId}`);
        if (!mounted) return;
        setPayments(res.data || []);
      } catch (err) {
        console.error("Payments fetch:", err);
        setError(
          err.response?.data?.message ||
            err.message ||
            "Failed to load payments"
        );
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => (mounted = false);
  }, [studentId]);

  // check if already paid for current month
  const paidForCurrent = payments.some(
    (p) =>
      String(p.month) === currentMonthStr &&
      String(p.status).toLowerCase() === "paid"
  );

  // show last known amount (last payment or room's default) — backend returns amount on payments
  const lastPayment = payments[0];
  const suggestedAmount = lastPayment?.amount ?? null;

  const handlePay = async () => {
    if (!studentId) return alert("You must be logged in as a student.");
    if (paidForCurrent) return alert(`Already paid for ${currentMonthStr}`);
    if (!confirm(`Pay rent for ${currentMonthStr}?`)) return;

    setPaying(true);
    setError(null);
    try {
      // send amount if you want to override; otherwise backend will pick room price or default
      const body = {
        month: currentMonthStr,
        // amount: suggestedAmount ?? undefined,
        payment_method: "Online",
      };
      const res = await api.post("/payments/pay", body);
      // push new payment into UI
      setPayments((prev) => [
        {
          payment_id: res.data.payment_id,
          student_id: studentId,
          amount: res.data.amount || suggestedAmount,
          month: res.data.month,
          payment_method: res.data.payment_method || "Online",
          payment_date: new Date().toISOString(),
          status: "Paid",
        },
        ...prev,
      ]);
      alert(res.data.message || "Payment successful");
    } catch (err) {
      console.error("Pay error:", err);
      setError(err.response?.data?.message || err.message || "Payment failed");
      alert(err.response?.data?.message || err.message || "Payment failed");
    } finally {
      setPaying(false);
    }
  };

  if (loading)
    return <div className="p-8 text-center">Loading payments...</div>;

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">Payments</h2>

      <div className="mb-4">
        <div className="flex items-center gap-4">
          <div>
            <div className="text-sm text-slate-600">Current month</div>
            <div className="text-lg font-semibold">{currentMonthStr}</div>
          </div>

          <div>
            <div className="text-sm text-slate-600">Suggested amount</div>
            <div className="text-lg font-medium">₹{suggestedAmount ?? "—"}</div>
          </div>

          <div className="ml-auto">
            <button
              onClick={handlePay}
              disabled={paidForCurrent || paying}
              className={`px-3 py-1 rounded text-white ${
                paidForCurrent ? "bg-gray-400" : "bg-green-600"
              }`}
            >
              {paidForCurrent ? "Paid" : paying ? "Processing..." : "Pay Now"}
            </button>
          </div>
        </div>
        {error && <div className="text-red-600 mt-2">{error}</div>}
      </div>

      <div className="bg-white rounded shadow p-4">
        <table className="w-full">
          <thead>
            <tr>
              <th className="p-2 text-left">ID</th>
              <th className="p-2 text-left">Month</th>
              <th className="p-2 text-left">Amount</th>
              <th className="p-2 text-left">Method</th>
              <th className="p-2 text-left">Date</th>
              <th className="p-2 text-left">Status</th>
            </tr>
          </thead>
          <tbody>
            {payments.length === 0 && (
              <tr>
                <td colSpan="6" className="p-4 text-center text-slate-600">
                  No payments yet
                </td>
              </tr>
            )}
            {payments.map((p) => (
              <tr
                key={p.payment_id || `${p.month}-${p.payment_date || ""}`}
                className="border-t"
              >
                <td className="p-2">{p.payment_id}</td>
                <td className="p-2">{p.month}</td>
                <td className="p-2">₹{p.amount}</td>
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
