// components/PartnerSelector.tsx
import { useState } from 'react';
import { usePartners } from '../hooks/usePartners';
import type { Partner } from '../lib/models/Partner';

interface PartnerSelectorProps {
  bookingId: string;
  onAssign: (bookingId: string, partnerId: string) => Promise<void>;
  disabled?: boolean;
  filterOnline?: boolean;
}

export default function PartnerSelector({ 
  bookingId, 
  onAssign, 
  disabled = false,
  filterOnline = true 
}: PartnerSelectorProps) {
  const [selectedPartner, setSelectedPartner] = useState<string>('');
  const [assigning, setAssigning] = useState(false);

  const { 
    partners, 
    loading, 
    error, 
    refetch,
    getOnlinePartners 
  } = usePartners({ 
    filterStatus: filterOnline ? 'online' : undefined 
  });

  const availablePartners = filterOnline ? getOnlinePartners() : partners;

  const handleAssign = async () => {
    if (!selectedPartner || assigning) return;

    try {
      setAssigning(true);
      await onAssign(bookingId, selectedPartner);
      setSelectedPartner(''); // Reset selection
      await refetch(); // Refresh partner list
    } catch (error) {
      console.error('Assignment failed:', error);
    } finally {
      setAssigning(false);
    }
  };

  if (loading) {
    return (
      <div style={{ padding: '12px', background: '#f8f9fa', borderRadius: '8px' }}>
        Loading partners...
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: '12px', background: '#fee', border: '1px solid #fcc', borderRadius: '8px', color: '#c00' }}>
        <span>⚠️ {error}</span>
        <button 
          onClick={refetch} 
          style={{ marginLeft: '10px', padding: '4px 12px', background: '#dc3545', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
        >
          Retry
        </button>
      </div>
    );
  }

  if (availablePartners.length === 0) {
    return (
      <div style={{ padding: '12px', background: '#fff3cd', border: '1px solid #ffc107', borderRadius: '8px', color: '#856404' }}>
        <span>🚫 {filterOnline ? 'No online partners available' : 'No partners found'}</span>
        <button 
          onClick={refetch}
          style={{ marginLeft: '10px', padding: '4px 12px', background: '#ffc107', color: '#000', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
        >
          🔄 Refresh
        </button>
      </div>
    );
  }

  const selectedPartnerData = partners.find(p => p._id === selectedPartner);

  return (
    <div style={{ width: '100%' }}>
      <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '600', color: '#374151' }}>
        Assign Partner 
        <span style={{ marginLeft: '8px', fontSize: '12px', fontWeight: '400', color: '#6b7280' }}>
          ({availablePartners.length} available)
        </span>
      </label>

      <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
        <select
          value={selectedPartner}
          onChange={(e) => setSelectedPartner(e.target.value)}
          disabled={disabled || assigning}
          style={{
            flex: 1,
            padding: '10px 12px',
            fontSize: '14px',
            border: '1px solid #d1d5db',
            borderRadius: '8px',
            background: 'white',
            cursor: disabled || assigning ? 'not-allowed' : 'pointer',
            opacity: disabled || assigning ? 0.6 : 1
          }}
        >
          <option value="">Select a partner...</option>
          {availablePartners.map((partner) => (
            <option key={partner._id} value={partner._id}>
              {partner.name}
              {partner.rating ? ` ⭐ ${partner.rating}` : ''}
              {partner.vehicleInfo ? ` - ${partner.vehicleInfo.model}` : ''}
              {partner.completedBookings ? ` (${partner.completedBookings} trips)` : ''}
            </option>
          ))}
        </select>

        <button
          onClick={handleAssign}
          disabled={!selectedPartner || disabled || assigning}
          style={{
            padding: '10px 20px',
            fontSize: '14px',
            fontWeight: '600',
            color: 'white',
            background: (!selectedPartner || disabled || assigning) ? '#9ca3af' : '#3b82f6',
            border: 'none',
            borderRadius: '8px',
            cursor: (!selectedPartner || disabled || assigning) ? 'not-allowed' : 'pointer',
            transition: 'all 0.2s'
          }}
        >
          {assigning ? 'Assigning...' : 'Assign'}
        </button>
      </div>

      {/* Partner Preview */}
      {selectedPartnerData && (
        <div style={{ 
          padding: '16px', 
          background: '#f9fafb', 
          border: '1px solid #e5e7eb', 
          borderRadius: '8px',
          animation: 'slideIn 0.3s ease-out'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
            <div style={{
              width: '48px',
              height: '48px',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: '700',
              fontSize: '16px'
            }}>
              {selectedPartnerData.name.split(' ').map(n => n[0]).join('')}
            </div>
            
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: '600', color: '#111827', marginBottom: '4px' }}>
                {selectedPartnerData.name}
              </div>
              <div style={{ display: 'flex', gap: '12px', fontSize: '12px', color: '#6b7280' }}>
                <span>📞 {selectedPartnerData.phone}</span>
                <span>✉️ {selectedPartnerData.email}</span>
              </div>
            </div>

            <div style={{
              padding: '4px 12px',
              borderRadius: '12px',
              fontSize: '11px',
              fontWeight: '600',
              textTransform: 'uppercase',
              background: selectedPartnerData.status === 'online' ? '#d1fae5' : '#dbeafe',
              color: selectedPartnerData.status === 'online' ? '#065f46' : '#1e40af'
            }}>
              {selectedPartnerData.status}
            </div>
          </div>

          {selectedPartnerData.vehicleInfo && (
            <div style={{ 
              display: 'flex', 
              gap: '12px', 
              padding: '12px', 
              background: 'white', 
              borderRadius: '6px',
              marginBottom: '12px'
            }}>
              <div style={{ fontSize: '24px' }}>🚗</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: '600', color: '#374151', marginBottom: '4px' }}>
                  {selectedPartnerData.vehicleInfo.type} - {selectedPartnerData.vehicleInfo.model}
                </div>
                <div style={{ display: 'flex', gap: '8px', fontSize: '12px', color: '#6b7280' }}>
                  <span>{selectedPartnerData.vehicleInfo.number}</span>
                  <span>•</span>
                  <span>{selectedPartnerData.vehicleInfo.capacity} seats</span>
                </div>
              </div>
            </div>
          )}

          {(selectedPartnerData.rating || selectedPartnerData.completedBookings) && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
              {selectedPartnerData.rating && (
                <div style={{ padding: '8px 12px', background: 'white', borderRadius: '6px' }}>
                  <div style={{ fontSize: '11px', color: '#6b7280', textTransform: 'uppercase', fontWeight: '600', marginBottom: '4px' }}>
                    Rating
                  </div>
                  <div style={{ fontSize: '14px', color: '#111827', fontWeight: '600' }}>
                    ⭐ {selectedPartnerData.rating}
                  </div>
                </div>
              )}
              {selectedPartnerData.completedBookings && (
                <div style={{ padding: '8px 12px', background: 'white', borderRadius: '6px' }}>
                  <div style={{ fontSize: '11px', color: '#6b7280', textTransform: 'uppercase', fontWeight: '600', marginBottom: '4px' }}>
                    Completed
                  </div>
                  <div style={{ fontSize: '14px', color: '#111827', fontWeight: '600' }}>
                    {selectedPartnerData.completedBookings} trips
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}