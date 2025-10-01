export interface Document {
  docType: string;
  docLink: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
}

export interface Address {
  buildingAreaName: string;
  houseNumber: string;
  streetAddress: string;
  zip: string;
  latitude: number;
  longitude: number;
}

export interface Booking {
  _id: string;
  userId: string;
  packageId: string;
  startDate: string;
  endDate: string;
  isSelfPickup: boolean;
  location: string;
  deliveryTime: { startHour: number; endHour: number };
  selectedPlan: { duration: number; price: number };
  priceBreakDown: { basePrice: number; deliveryCharge: number; grandTotal: number };
  document: Document[];
  address: Address;
  partnerId?: string;
}

export interface Partner {
  _id: string;
  name: string;
  city: string;
  status: 'online' | 'offline';
  location: { lat: number; lng: number };
}
