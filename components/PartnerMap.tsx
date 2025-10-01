import React, { useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

interface PartnerLocation {
  partnerId: string;
  lat: number;
  lng: number;
  timestamp: string;
}

interface Props {
  locations: Record<string, PartnerLocation>;
}

// Fix Leaflet default icon issue
const defaultIcon = L.icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

L.Marker.prototype.options.icon = defaultIcon;

const center: [number, number] = [20.5937, 78.9629]; // Center on India roughly

export default function PartnerMap({ locations }: Props) {
  const partnerMarkers = Object.values(locations);

  // Fix for SSR issues with Leaflet
  useEffect(() => {
    if (typeof window !== "undefined") {
      delete (L.Icon.Default.prototype as any)._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
        iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
        shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
      });
    }
  }, []);

  return (
    <MapContainer 
      center={center} 
      zoom={5} 
      style={{ height: 400, width: "100%" }}
      scrollWheelZoom={false}
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution="&copy; OpenStreetMap contributors"
      />
      {partnerMarkers.map((loc) => (
        <Marker key={loc.partnerId} position={[loc.lat, loc.lng]}>
          <Popup>
            Partner ID: {loc.partnerId}
            <br />
            Updated: {new Date(loc.timestamp).toLocaleTimeString()}
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}