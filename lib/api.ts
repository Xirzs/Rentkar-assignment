// lib/api.ts
export async function fetchBookings() {
  const res = await fetch('/api/bookings');
  if (!res.ok) throw new Error('Failed to fetch bookings');
  return await res.json();
}

export async function assignPartner(bookingId: string, partnerId: string) {
  const res = await fetch(`/api/bookings/${bookingId}/assign`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ partnerId }),
  });
  if (!res.ok) throw new Error('Failed to assign partner');
  return await res.json();
}

export async function confirmBooking(bookingId: string) {
  const res = await fetch(`/api/bookings/${bookingId}/confirm`, {
    method: 'POST',
  });
  if (!res.ok) throw new Error('Failed to confirm booking');
  return await res.json();
}

export async function updateDocumentStatus(bookingId: string, docId: string, status: string) {
  const res = await fetch(`/api/bookings/${bookingId}/documents/${docId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status }),
  });
  if (!res.ok) throw new Error('Failed to update document status');
  return await res.json();
}
