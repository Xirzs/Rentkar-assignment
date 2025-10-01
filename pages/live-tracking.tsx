// pages/live-tracking.tsx
import dynamic from 'next/dynamic';
import { useLivePartnerLocations } from '@/hooks/useLivePartnerLocations';

// Dynamically import PartnerMap with SSR disabled
const PartnerMap = dynamic(() => import('@/components/PartnerMap'), {
  ssr: false,
  loading: () => (
    <div style={{ 
      height: 400, 
      width: '100%', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center',
      backgroundColor: '#f0f0f0',
      borderRadius: 8,
      border: '1px solid #ddd'
    }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: 18, marginBottom: 8 }}>Loading map...</div>
        <div style={{ fontSize: 14, color: '#666' }}>Please wait</div>
      </div>
    </div>
  ),
});

export default function LiveTrackingPage() {
  // Use the custom hook to get live partner locations
  const { locations } = useLivePartnerLocations();

  // Convert array to Record format for PartnerMap component
  const locationsRecord = locations.reduce((acc, loc) => {
    acc[loc.id] = {
      partnerId: loc.id,
      lat: loc.lat,
      lng: loc.lng,
      timestamp: loc.timestamp || new Date().toISOString(),
    };
    return acc;
  }, {} as Record<string, { partnerId: string; lat: number; lng: number; timestamp: string }>);

  const partnerCount = locations.length;

  return (
    <div style={{ padding: 20 }}>
      <div style={{ marginBottom: 20 }}>
        <h1 style={{ marginBottom: 10 }}>Live Partner Tracking</h1>
        <div style={{ 
          display: 'flex', 
          gap: 15, 
          marginBottom: 15 
        }}>
          <div style={{ 
            padding: 10, 
            border: '1px solid #ddd', 
            borderRadius: 5,
            backgroundColor: '#fff'
          }}>
            <strong>Active Partners:</strong> {partnerCount}
          </div>
          <div style={{ 
            padding: 10, 
            border: '1px solid #ddd', 
            borderRadius: 5,
            backgroundColor: partnerCount > 0 ? '#d4edda' : '#f8d7da',
            color: partnerCount > 0 ? '#155724' : '#721c24'
          }}>
            <strong>Status:</strong> {partnerCount > 0 ? 'Connected' : 'Waiting for data...'}
          </div>
        </div>
      </div>

      {/* Partner Map Component */}
      <PartnerMap locations={locationsRecord} />

      {/* Partner List */}
      {partnerCount > 0 && (
        <div style={{ marginTop: 20 }}>
          <h2 style={{ fontSize: 18, marginBottom: 10 }}>Partner Details</h2>
          <div style={{ display: 'grid', gap: 10 }}>
            {locations.map((location) => (
              <div
                key={location.id}
                style={{
                  padding: 12,
                  border: '1px solid #eee',
                  borderRadius: 8,
                  backgroundColor: '#fff',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}
              >
                <div>
                  <div style={{ fontWeight: 'bold', marginBottom: 4 }}>
                    Partner: {location.id}
                  </div>
                  <div style={{ fontSize: 14, color: '#666' }}>
                    📍 Lat: {location.lat.toFixed(4)}, Lng: {location.lng.toFixed(4)}
                  </div>
                </div>
                {location.timestamp && (
                  <div style={{ fontSize: 12, color: '#999' }}>
                    Last update: {new Date(location.timestamp).toLocaleTimeString()}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {partnerCount === 0 && (
        <div style={{
          marginTop: 20,
          padding: 20,
          textAlign: 'center',
          backgroundColor: '#f8f9fa',
          borderRadius: 8,
          color: '#666'
        }}>
          No active partners yet. Waiting for GPS data...
        </div>
      )}
    </div>
  );
}