import { useEffect, useState } from "react";
import type { Booking, Partner, DocumentStatus } from "../lib/mockData";
import PartnerSelector from "./PartnerSelector";

const USE_REAL_API = true;

const getStatusColor = (status: string) => {
  switch (status) {
    case "CONFIRMED":
    case "online":
      return "bg-emerald-500";
    case "ASSIGNED":
    case "busy":
      return "bg-blue-500";
    case "PENDING":
    case "offline":
      return "bg-amber-500";
    default:
      return "bg-slate-400";
  }
};

const getDocStatusColor = (status: DocumentStatus) => {
  switch (status) {
    case "APPROVED":
      return "bg-emerald-100 text-emerald-800 border-emerald-200";
    case "REJECTED":
      return "bg-red-100 text-red-800 border-red-200";
    default:
      return "bg-amber-100 text-amber-800 border-amber-200";
  }
};

const apiCall = async (url: string, options: RequestInit = {}) => {
  const response = await fetch(url, {
    headers: { "Content-Type": "application/json", ...options.headers },
    ...options,
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || `API call failed: ${response.statusText}`);
  }
  return data;
};

export default function Dashboard() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [partners, setPartners] = useState<Partner[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [filter, setFilter] = useState<"all" | "pending" | "assigned" | "confirmed">("all");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async (): Promise<void> => {
    try {
      setLoading(true);
      setError(null);

      const [bookingsResponse, partnersResponse] = await Promise.all([
        apiCall("/api/bookings"),
        apiCall("/api/partners"),
      ]);

      setBookings(bookingsResponse.bookings ?? []);
      setPartners(partnersResponse.partners ?? []);
    } catch (e) {
      const errorMsg = e instanceof Error ? e.message : "Failed to fetch data";
      setError(errorMsg);

      if (!USE_REAL_API) {
        const { mockApi } = await import("../lib/mockData");
        const [mockBookings, mockPartners] = await Promise.all([
          mockApi.getBookings(),
          mockApi.getPartners(),
        ]);
        setBookings(mockBookings);
        setPartners(mockPartners);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleAssignPartner = async (bookingId: string, partnerId: string): Promise<void> => {
    try {
      setActionLoading(`assign-${bookingId}`);
      setError(null);

      await apiCall(`/api/bookings/${bookingId}/assign`, {
        method: "POST",
        body: JSON.stringify({ partnerId }),
      });

      await fetchData();

      const partner = partners.find((p) => p._id === partnerId);
      alert(`✅ Partner ${partner?.name || partnerId} assigned successfully!`);
    } catch (e) {
      const errorMessage = e instanceof Error ? e.message : "Failed to assign partner";
      setError(errorMessage);
      alert(`❌ Error: ${errorMessage}`);
    } finally {
      setActionLoading(null);
    }
  };

  const handleDocumentAction = async (
    bookingId: string,
    docId: string,
    action: "approve" | "reject"
  ): Promise<void> => {
    try {
      setActionLoading(`doc-${docId}`);
      setError(null);

      await apiCall(`/api/bookings/${bookingId}/documents/${docId}`, {
        method: "PATCH",
        body: JSON.stringify({ status: action === "approve" ? "APPROVED" : "REJECTED" }),
      });

      await fetchData();
      alert(`✅ Document ${action}d successfully!`);
    } catch (e) {
      const errorMessage = e instanceof Error ? e.message : `Failed to ${action} document`;
      setError(errorMessage);
      alert(`❌ Error: ${errorMessage}`);
    } finally {
      setActionLoading(null);
    }
  };

  const handleConfirmBooking = async (bookingId: string): Promise<void> => {
    try {
      setActionLoading(`confirm-${bookingId}`);
      setError(null);

      await apiCall(`/api/bookings/${bookingId}/confirm`, { method: "POST" });

      await fetchData();
      alert("✅ Booking confirmed successfully!");
    } catch (e) {
      const errorMessage = e instanceof Error ? e.message : "Failed to confirm booking";
      setError(errorMessage);
      alert(`❌ Error: ${errorMessage}`);
    } finally {
      setActionLoading(null);
    }
  };

  const filteredBookings = bookings.filter((booking) => {
    if (filter === "all") return true;
    if (filter === "pending") return booking.status === "PENDING";
    if (filter === "assigned") return booking.status === "ASSIGNED";
    if (filter === "confirmed") return booking.status === "CONFIRMED";
    return true;
  });

  const canConfirmBooking = (booking: Booking): boolean =>
    booking.status === "ASSIGNED" &&
    !!booking.partnerId &&
    Array.isArray(booking.document) &&
    booking.document.every((d) => d.status === "APPROVED");

  const getAssignedPartnerName = (partnerId: string): string =>
    partners.find((p) => p._id === partnerId)?.name ?? partnerId;

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-slate-200 rounded-full animate-spin border-t-blue-500"></div>
            <div className="absolute inset-0 w-16 h-16 border-4 border-transparent rounded-full animate-pulse border-t-blue-300"></div>
          </div>
          <p className="text-slate-600 font-medium animate-pulse">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10 backdrop-blur-sm bg-white/80">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-semibold text-slate-800 tracking-tight">
                Rentkar Admin
              </h1>
              {error ? (
                <p className="text-sm text-red-600 mt-1">⚠️ {error}</p>
              ) : (
                <p className="text-sm text-emerald-600 mt-1">🟢 Connected to Database</p>
              )}
            </div>
            <button
              onClick={fetchData}
              className="px-3 py-2 rounded-md bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium"
            >
              Refresh
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-4 flex space-x-4">
        {["all", "pending", "assigned", "confirmed"].map((status) => (
          <button
            key={status}
            onClick={() => setFilter(status as any)}
            className={`px-3 py-2 rounded-md text-sm font-medium focus:outline-none ${
              filter === status
                ? "bg-blue-600 text-white"
                : "bg-slate-200 text-slate-700 hover:bg-slate-300"
            }`}
          >
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </button>
        ))}
      </div>

      <main className="max-w-7xl mx-auto px-6 pb-32 space-y-6">
        {filteredBookings.length === 0 ? (
          <p className="text-center text-slate-500 mt-12">No bookings found.</p>
        ) : (
          filteredBookings.map((booking) => (
            <section
              key={booking._id}
              className="bg-white rounded-lg shadow p-6 space-y-4 border border-slate-200"
            >
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-lg font-semibold text-slate-900">
                    Booking ID: {booking._id}
                  </h2>
                   <p className="text-sm text-slate-600">
                    Location: {booking.location},{" "}
                    {(booking as any).address && typeof (booking as any).address === "object"
                      ? [
                          (booking as any).address.buildingAreaName,
                          (booking as any).address.houseNumber,
                          (booking as any).address.streetAddress,
                          (booking as any).address.zip
                        ].filter(Boolean).join(', ')
                      : 'No address'}
                  </p>

                </div>
                <span
                  className={`inline-block px-3 py-1 rounded-full text-xs font-semibold text-white ${getStatusColor(
                    booking.status
                  )}`}
                >
                  {booking.status}
                </span>
              </div>

              <div className="flex items-center space-x-4">
                <label className="text-sm font-medium text-slate-700">
                  Assigned Partner:
                </label>
                
                {booking.partnerId ? (
                  <span>{getAssignedPartnerName(booking.partnerId)}</span>
                ) : (
                  <PartnerSelector
                    bookingId={booking._id}
                    onAssign={handleAssignPartner}
                    disabled={!!actionLoading}
                    filterOnline={true}
                  />
                )}

                {actionLoading === `assign-${booking._id}` && (
                  <span className="text-blue-600 text-sm">Assigning...</span>
                )}
              </div>

              <div className="space-y-2">
                <p className="font-medium text-slate-700">Documents:</p>
                <ul className="space-y-1">
                  {booking.document?.map((doc) => (
                    <li
                      key={doc._id}
                      className={`inline-flex items-center space-x-2 px-3 py-1 rounded border text-xs font-semibold ${getDocStatusColor(
                        doc.status
                      )}`}
                    >
                      <span>{doc.docType}</span>
                      <div>
                        {doc.status === "PENDING" ? (
                          <>
                            <button
                              disabled={!!actionLoading}
                              onClick={() =>
                                handleDocumentAction(booking._id, doc._id, "approve")
                              }
                              className="text-green-600 hover:underline mr-2"
                            >
                              Approve
                            </button>
                            <button
                              disabled={!!actionLoading}
                              onClick={() =>
                                handleDocumentAction(booking._id, doc._id, "reject")
                              }
                              className="text-red-600 hover:underline"
                            >
                              Reject
                            </button>
                          </>
                        ) : (
                          <span>{doc.status}</span>
                        )}
                      </div>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="mt-4">
                <button
                  disabled={!canConfirmBooking(booking) || !!actionLoading}
                  onClick={() => handleConfirmBooking(booking._id)}
                  className={`px-4 py-2 rounded-md font-semibold text-white ${
                    canConfirmBooking(booking)
                      ? "bg-emerald-600 hover:bg-emerald-700"
                      : "bg-gray-400 cursor-not-allowed"
                  }`}
                >
                  {actionLoading === `confirm-${booking._id}`
                    ? "Confirming..."
                    : "Confirm Booking"}
                </button>
              </div>
            </section>
          ))
        )}
      </main>
    </div>
  );
}