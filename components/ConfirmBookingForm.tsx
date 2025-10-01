"use client";

import { useState } from "react";

interface ConfirmBookingFormProps {
  bookingId: string;
}

export default function ConfirmBookingForm({ bookingId }: ConfirmBookingFormProps) {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const handleConfirm = async () => {
    setLoading(true);
    setMessage(null);

    try {
      const res = await fetch(`/api/bookings/${bookingId}/confirm`, {
        method: "POST",
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to confirm booking");
      }

      setMessage(`✅ Booking ${data.bookingId} confirmed successfully!`);
    } catch (err: any) {
      setMessage(`❌ ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 border rounded-xl shadow-md bg-white flex flex-col gap-3">
      <h3 className="text-lg font-semibold">Confirm Booking</h3>
      <button
        onClick={handleConfirm}
        disabled={loading}
        className="px-4 py-2 rounded-lg bg-green-600 text-white font-medium hover:bg-green-700 disabled:opacity-50"
      >
        {loading ? "Confirming..." : "Confirm Booking"}
      </button>
      {message && <p className="text-sm">{message}</p>}
    </div>
  );
}
