import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import PartnerSelector from './PartnerSelector';

// Import your existing types from lib/models
import type { Booking } from '../lib/models/Booking';
import type { Partner } from '../lib/models/Partner';

// API Functions
const fetchBookings = async (): Promise<Booking[]> => {
  const response = await fetch('/api/bookings');
  if (!response.ok) throw new Error('Failed to fetch bookings');
  const data = await response.json();
  return data.bookings;
};

const fetchPartners = async (): Promise<Partner[]> => {
  const response = await fetch('/api/partners');
  if (!response.ok) throw new Error('Failed to fetch partners');
  const data = await response.json();
  return data.partners;
};

const assignPartner = async (bookingId: string, partnerId: string): Promise<void> => {
  const response = await fetch(`/api/bookings/${bookingId}/assign`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ partnerId }),
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to assign partner');
  }
};

const confirmBooking = async (bookingId: string): Promise<void> => {
  const response = await fetch(`/api/bookings/${bookingId}/confirm`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to confirm booking');
  }
};

const updateDocumentStatus = async (
  bookingId: string, 
  docId: string, 
  status: 'APPROVED' | 'REJECTED'
): Promise<void> => {
  const response = await fetch(`/api/bookings/${bookingId}/documents/${docId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status }),
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to update document');
  }
};

export default function BookingList() {
  const queryClient = useQueryClient();

  // Fetch bookings
  const { 
    data: bookings, 
    isLoading: bookingsLoading, 
    error: bookingsError 
  } = useQuery<Booking[], Error>({
    queryKey: ['bookings'],
    queryFn: fetchBookings,
  });

  // Fetch partners (for displaying assigned partner info)
  const { 
    data: partners 
  } = useQuery<Partner[], Error>({
    queryKey: ['partners'],
    queryFn: fetchPartners,
  });

  // Assign partner mutation
  const assignMutation = useMutation<void, Error, { bookingId: string; partnerId: string }>({
    mutationFn: ({ bookingId, partnerId }) => assignPartner(bookingId, partnerId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
      queryClient.invalidateQueries({ queryKey: ['partners'] });
      alert('✅ Partner assigned successfully!');
    },
    onError: (error) => {
      alert(`❌ Error: ${error.message}`);
    },
  });

  // Confirm booking mutation
  const confirmMutation = useMutation<void, Error, string>({
    mutationFn: (bookingId) => confirmBooking(bookingId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
      alert('✅ Booking confirmed successfully!');
    },
    onError: (error) => {
      alert(`❌ Error: ${error.message}`);
    },
  });

  // Update document mutation
  const updateDocMutation = useMutation<void, Error, { bookingId: string; docId: string; status: 'APPROVED' | 'REJECTED' }>({
    mutationFn: ({ bookingId, docId, status }) => 
      updateDocumentStatus(bookingId, docId, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
      alert('✅ Document updated successfully!');
    },
    onError: (error) => {
      alert(`❌ Error: ${error.message}`);
    },
  });

  // Handle partner assignment
  const handleAssignPartner = async (bookingId: string, partnerId: string) => {
    await assignMutation.mutateAsync({ bookingId, partnerId });
  };

  // Helper function
  const canConfirmBooking = (booking: Booking): boolean => {
    return (
      booking.status === 'ASSIGNED' &&
      booking.assignedPartner !== undefined &&
      (booking.document?.every((doc) => doc.status === 'APPROVED') || false)
    );
  };

  if (bookingsLoading) {
    return (
      <div style={{ padding: 20, textAlign: 'center' }}>
        <div>Loading bookings...</div>
      </div>
    );
  }

  if (bookingsError) {
    return (
      <div style={{ padding: 20, color: 'red' }}>
        Error loading bookings: {bookingsError.message}
      </div>
    );
  }

  return (
    <div style={{ padding: 20 }}>
      <h1>Rentkar Booking Management</h1>
      
      {/* Summary Stats */}
      <div style={{ marginBottom: 20, display: 'flex', gap: 20 }}>
        <div style={{ padding: 10, border: '1px solid #ddd', borderRadius: 5 }}>
          <strong>Total Bookings:</strong> {bookings?.length ?? 0}
        </div>
        <div style={{ padding: 10, border: '1px solid #ddd', borderRadius: 5 }}>
          <strong>Pending:</strong> {bookings?.filter(b => b.status === 'PENDING').length ?? 0}
        </div>
        <div style={{ padding: 10, border: '1px solid #ddd', borderRadius: 5 }}>
          <strong>Pending Docs:</strong>{' '}
          {bookings?.reduce(
            (count, b) => count + (b.document?.filter((d) => d.status === 'PENDING').length ?? 0),
            0
          ) ?? 0}
        </div>
      </div>

      {/* Bookings List */}
      {bookings && bookings.length === 0 ? (
        <div style={{ padding: 20, textAlign: 'center', color: '#666' }}>
          No bookings found
        </div>
      ) : (
        bookings?.map((booking) => {
          // Add type guard to ensure _id exists and is stringifiable
          if (!booking._id) return null;
          
          return (
            <div
              key={booking._id.toString()}
              style={{
                border: '1px solid #eee',
                borderRadius: 8,
                marginBottom: 15,
                padding: 15,
                backgroundColor: '#fff',
              }}
            >
              {/* Booking Header */}
              <div style={{ marginBottom: 10 }}>
                <h3 style={{ margin: 0, marginBottom: 5 }}>
                  Booking ID: {booking._id.toString()}
                </h3>
                <div style={{ display: 'flex', gap: 15, fontSize: 14, color: '#666' }}>
                  <span>📍 {booking.location ?? "Unknown location"}</span>
                  <span>💰 ₹{booking.priceBreakDown?.grandTotal ?? "N/A"}</span>
                  <span
                    style={{
                      padding: '2px 8px',
                      borderRadius: 4,
                      backgroundColor:
                        booking.status === 'CONFIRMED'
                          ? '#d4edda'
                          : booking.status === 'ASSIGNED'
                          ? '#cce5ff'
                          : '#fff3cd',
                      color:
                        booking.status === 'CONFIRMED'
                          ? '#155724'
                          : booking.status === 'ASSIGNED'
                          ? '#004085'
                          : '#856404',
                    }}
                  >
                    {booking.status}
                  </span>
                </div>
              </div>

              {/* Documents */}
              {booking.document && booking.document.length > 0 && (
                <div style={{ marginBottom: 10 }}>
                  <h4 style={{ margin: '10px 0 5px 0', fontSize: 14 }}>
                    Documents ({booking.document.length}):
                  </h4>
                  {booking.document.map((doc) => {
                    // Add type guard for doc._id and safe rendering for docType and status
                    if (!doc._id) return null;
                    
                    return (
                      <div
                        key={doc._id.toString()}
                        style={{
                          marginBottom: 8,
                          padding: 8,
                          backgroundColor: '#f8f9fa',
                          borderRadius: 4,
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                        }}
                      >
                        <span style={{ fontSize: 14 }}>
                          <strong>{doc.docType ?? "Document"}:</strong>{' '}
                          <span
                            style={{
                              color:
                                doc.status === 'APPROVED'
                                  ? 'green'
                                  : doc.status === 'REJECTED'
                                  ? 'red'
                                  : 'orange',
                            }}
                          >
                            {doc.status}
                          </span>
                        </span>
                        {doc.status === 'PENDING' && (
                          <div>
                            <button
                              style={{
                                marginLeft: 10,
                                padding: '4px 12px',
                                backgroundColor: '#28a745',
                                color: 'white',
                                border: 'none',
                                borderRadius: 4,
                                cursor: 'pointer',
                              }}
                              onClick={() =>
                                updateDocMutation.mutate({
                                  bookingId: booking._id!,
                                  docId: doc._id!,
                                  status: 'APPROVED',
                                })
                              }
                              disabled={updateDocMutation.isPending}
                            >
                              Approve
                            </button>
                            <button
                              style={{
                                marginLeft: 5,
                                padding: '4px 12px',
                                backgroundColor: '#dc3545',
                                color: 'white',
                                border: 'none',
                                borderRadius: 4,
                                cursor: 'pointer',
                              }}
                              onClick={() =>
                                updateDocMutation.mutate({
                                  bookingId: booking._id!,
                                  docId: doc._id!,
                                  status: 'REJECTED',
                                })
                              }
                              disabled={updateDocMutation.isPending}
                            >
                              Reject
                            </button>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Partner Selector Component */}
              {booking.status === 'PENDING' && !booking.assignedPartner && (
                <div style={{ marginTop: 15, padding: 15, background: '#f9fafb', borderRadius: 8 }}>
                  <PartnerSelector
                    bookingId={booking._id}
                    onAssign={handleAssignPartner}
                    disabled={assignMutation.isPending}
                    filterOnline={true}
                  />
                </div>
              )}

              {/* Assigned Partner Info */}
              {booking.assignedPartner && (
                <div style={{ marginTop: 10, padding: 8, backgroundColor: '#e7f3ff', borderRadius: 4 }}>
                  <strong>Assigned Partner:</strong>{' '}
                  {partners?.find((p) => p._id === booking.assignedPartner)?.name ?? 
                   booking.assignedPartner.toString()}
                </div>
              )}

              {/* Confirm Booking Button */}
              {canConfirmBooking(booking) && (
                <button
                  style={{
                    marginTop: 10,
                    padding: '8px 20px',
                    backgroundColor: '#28a745',
                    color: 'white',
                    border: 'none',
                    borderRadius: 4,
                    cursor: 'pointer',
                    fontSize: 14,
                    fontWeight: 'bold',
                  }}
                  onClick={() => confirmMutation.mutate(booking._id!)}
                  disabled={confirmMutation.isPending}
                >
                  {confirmMutation.isPending ? 'Confirming...' : '✓ Confirm Booking'}
                </button>
              )}

              {/* Status Messages */}
              {booking.status === 'ASSIGNED' && !canConfirmBooking(booking) && (
                <div style={{ marginTop: 10, padding: 8, backgroundColor: '#fff3cd', borderRadius: 4, fontSize: 14 }}>
                  ⏳ Waiting for all documents to be approved before confirmation
                </div>
              )}

              {booking.status === 'CONFIRMED' && (
                <div style={{ marginTop: 10, padding: 8, backgroundColor: '#d4edda', borderRadius: 4, fontSize: 14 }}>
                  ✅ Booking confirmed!
                </div>
              )}
            </div>
          );
        })
      )}
      
    </div>
  );
}
