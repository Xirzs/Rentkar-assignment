export interface PartnerLocation {
  lat: number;
  lng: number;
  accuracy?: number;
  lastUpdated: Date;
}

export interface Partner {
  _id?: string;
  name: string;
  email: string;
  phone: string;
  status: 'online' | 'busy' | 'offline';
  location?: PartnerLocation;
  
  // Partner details
  vehicleInfo?: {
    type: string;
    model: string;
    number: string;
    capacity: number;
  };
  
  // Performance metrics
  rating?: number;
  completedBookings?: number;
  
  // Timestamps
  createdAt: Date;
  lastActiveAt: Date;
}

// Helper functions
export const PartnerHelpers = {
  isOnline: (partner: Partner): boolean => {
    return partner.status === 'online';
  },
  
  calculateDistance: (partner: Partner, booking: { lat: number; lng: number }): number => {
    if (!partner.location) return Infinity;
    
    // Simple distance calculation (Haversine formula)
    const R = 6371; // Earth's radius in km
    const dLat = (booking.lat - partner.location.lat) * Math.PI / 180;
    const dLng = (booking.lng - partner.location.lng) * Math.PI / 180;
    
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(partner.location.lat * Math.PI / 180) * 
              Math.cos(booking.lat * Math.PI / 180) *
              Math.sin(dLng/2) * Math.sin(dLng/2);
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  },
  
  findNearestOnlinePartners: (partners: Partner[], bookingLocation: { lat: number; lng: number }, limit = 5): Partner[] => {
    return partners
      .filter(p => PartnerHelpers.isOnline(p) && p.location)
      .sort((a, b) => 
        PartnerHelpers.calculateDistance(a, bookingLocation) - 
        PartnerHelpers.calculateDistance(b, bookingLocation)
      )
      .slice(0, limit);
  }
};