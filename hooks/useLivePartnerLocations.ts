import { useEffect, useState } from "react";

interface PartnerLocation {
  id: string;
  lat: number;
  lng: number;
  timestamp?: string;
}

export function useLivePartnerLocations() {
  const [locations, setLocations] = useState<PartnerLocation[]>([]);

  useEffect(() => {
    const ws = new WebSocket(`ws://${window.location.host}/api/ws`);

    ws.onopen = () => {
      console.log('WebSocket connected');
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        setLocations((locs) => {
          // Add or update partner location
          const idx = locs.findIndex((l) => l.id === data.id);
          if (idx >= 0) {
            locs[idx] = data;
            return [...locs];
          } else {
            return [...locs, data];
          }
        });
      } catch (e) {
        console.error('Invalid GPS data:', e);
      }
    };

    ws.onerror = (err) => {
      console.error('WebSocket error:', err);
    };

    ws.onclose = () => {
      console.log('WebSocket disconnected');
    };

    return () => {
      ws.close();
    };
  }, []);

  return { locations };
}