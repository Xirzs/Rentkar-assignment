// lib/mockData.ts
// lib/mockData.ts

export type PartnerStatus = "online" | "busy" | "offline";
export type BookingStatus = "PENDING" | "ASSIGNED" | "CONFIRMED";
export type DocumentStatus = "PENDING" | "APPROVED" | "REJECTED";

export interface Partner {
  _id: string;
  name: string;
  email: string;
  phone: string;
  status: PartnerStatus;
  // Support both formats for backwards compatibility
  location?: {
    lat: number;
    lng: number;
    lastUpdated: string;
  };
  // MongoDB GeoJSON format (used by database)
  currentLocation?: {
    type: "Point";
    coordinates: [number, number]; // [longitude, latitude]
  };
  lastUpdated?: string;
  vehicleInfo?: {
    type: string;
    model: string;
    number: string;
    capacity: number;
  };
  rating?: number;
  completedBookings?: number;
  createdAt: string;
  lastActiveAt: string;
}

export interface Document {
  _id: string;
  docType: string;
  status: DocumentStatus;
  uploadedAt?: string;
  reviewedAt?: string;
  reviewedBy?: string;
}

export interface Booking {
  _id: string;
  userId: string;
  location: string;
  address: string;
  status: BookingStatus;
  partnerId?: string;
  priceBreakDown: {
    basePrice: number;
    taxes: number;
    fees: number;
    grandTotal: number;
  };
  assignedPartner?: string;
  document?: Document[];
  createdAt: string;
  updatedAt: string;
  confirmedAt?: string;
  pickupTime?: string;
  dropoffTime?: string;
  vehicleType?: string;
  notes?: string;
}

// Rest of your mockData remains the same...
// Keep all your existing mockPartners, mockBookings, and mockApi code// Mock Partners Data
export const mockPartners: Partner[] = [
  {
    _id: "partner_1",
    name: "Rajesh Kumar",
    email: "rajesh@example.com",
    phone: "+91-9876543210",
    status: "online",
    location: {
      lat: 19.2183,
      lng: 72.9781,
      lastUpdated: new Date().toISOString(),
    },
    vehicleInfo: {
      type: "Car",
      model: "Maruti Swift",
      number: "MH-01-AB-1234",
      capacity: 4,
    },
    rating: 4.5,
    completedBookings: 150,
    createdAt: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString(),
    lastActiveAt: new Date().toISOString(),
  },
  {
    _id: "partner_2",
    name: "Amit Sharma",
    email: "amit@example.com",
    phone: "+91-9876543211",
    status: "busy",
    location: {
      lat: 19.076,
      lng: 72.8777,
      lastUpdated: new Date().toISOString(),
    },
    vehicleInfo: {
      type: "Car",
      model: "Hyundai i20",
      number: "MH-02-CD-5678",
      capacity: 4,
    },
    rating: 4.2,
    completedBookings: 120,
    createdAt: new Date(Date.now() - 300 * 24 * 60 * 60 * 1000).toISOString(),
    lastActiveAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
  },
  {
    _id: "partner_3",
    name: "Priya Singh",
    email: "priya@example.com",
    phone: "+91-9876543212",
    status: "online",
    location: {
      lat: 19.1197,
      lng: 72.9073,
      lastUpdated: new Date().toISOString(),
    },
    vehicleInfo: {
      type: "Car",
      model: "Honda City",
      number: "MH-03-EF-9012",
      capacity: 4,
    },
    rating: 4.7,
    completedBookings: 200,
    createdAt: new Date(Date.now() - 400 * 24 * 60 * 60 * 1000).toISOString(),
    lastActiveAt: new Date().toISOString(),
  },
  {
    _id: "partner_4",
    name: "Vikram Patel",
    email: "vikram@example.com",
    phone: "+91-9876543213",
    status: "offline",
    location: {
      lat: 19.2521,
      lng: 72.8562,
      lastUpdated: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
    },
    vehicleInfo: {
      type: "Car",
      model: "Tata Nexon",
      number: "MH-04-GH-3456",
      capacity: 5,
    },
    rating: 4.0,
    completedBookings: 80,
    createdAt: new Date(Date.now() - 200 * 24 * 60 * 60 * 1000).toISOString(),
    lastActiveAt: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
  },
  {
    _id: "partner_5",
    name: "Sneha Reddy",
    email: "sneha@example.com",
    phone: "+91-9876543214",
    status: "online",
    location: {
      lat: 19.1136,
      lng: 72.8697,
      lastUpdated: new Date().toISOString(),
    },
    vehicleInfo: {
      type: "Car",
      model: "Toyota Innova",
      number: "MH-05-IJ-7890",
      capacity: 7,
    },
    rating: 4.8,
    completedBookings: 250,
    createdAt: new Date(Date.now() - 500 * 24 * 60 * 60 * 1000).toISOString(),
    lastActiveAt: new Date().toISOString(),
  },
  {
    _id: "partner_6",
    name: "Arjun Mehta",
    email: "arjun@example.com",
    phone: "+91-9876543215",
    status: "online",
    location: {
      lat: 19.0176,
      lng: 72.8462,
      lastUpdated: new Date().toISOString(),
    },
    vehicleInfo: {
      type: "Car",
      model: "Mahindra XUV300",
      number: "MH-06-KL-2345",
      capacity: 5,
    },
    rating: 4.3,
    completedBookings: 95,
    createdAt: new Date(Date.now() - 180 * 24 * 60 * 60 * 1000).toISOString(),
    lastActiveAt: new Date().toISOString(),
  },
];

// Mock Bookings Data
export const mockBookings: Booking[] = [
  {
    _id: "64f1a2b3c4d5e6f7a8b9c0d1",
    userId: "user_123",
    location: "Mumbai, Maharashtra",
    address: "123 Marine Drive, Mumbai, MH 400001",
    status: "PENDING",
    priceBreakDown: {
      basePrice: 1200,
      taxes: 200,
      fees: 100,
      grandTotal: 1500,
    },
    document: [
      {
        _id: "doc1",
        docType: "License",
        status: "PENDING",
        uploadedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      },
      {
        _id: "doc2",
        docType: "Insurance",
        status: "APPROVED",
        uploadedAt: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
        reviewedAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
        reviewedBy: "admin_1",
      },
    ],
    createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    vehicleType: "Sedan",
    pickupTime: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    dropoffTime: new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString(),
  },
  {
    _id: "64f1a2b3c4d5e6f7a8b9c0d2",
    userId: "user_456",
    location: "Delhi, NCR",
    address: "456 Connaught Place, New Delhi, DL 110001",
    status: "ASSIGNED",
    priceBreakDown: {
      basePrice: 1600,
      taxes: 300,
      fees: 100,
      grandTotal: 2000,
    },
    assignedPartner: "partner_1",
    document: [
      {
        _id: "doc3",
        docType: "License",
        status: "APPROVED",
        uploadedAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
        reviewedAt: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
        reviewedBy: "admin_1",
      },
      {
        _id: "doc4",
        docType: "Insurance",
        status: "APPROVED",
        uploadedAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
        reviewedAt: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
        reviewedBy: "admin_1",
      },
    ],
    createdAt: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
    vehicleType: "SUV",
    pickupTime: new Date(Date.now() + 12 * 60 * 60 * 1000).toISOString(),
    dropoffTime: new Date(Date.now() + 36 * 60 * 60 * 1000).toISOString(),
  },
  {
    _id: "64f1a2b3c4d5e6f7a8b9c0d3",
    userId: "user_789",
    location: "Bangalore, Karnataka",
    address: "789 MG Road, Bangalore, KA 560001",
    status: "CONFIRMED",
    priceBreakDown: {
      basePrice: 1500,
      taxes: 200,
      fees: 100,
      grandTotal: 1800,
    },
    assignedPartner: "partner_2",
    document: [
      {
        _id: "doc5",
        docType: "License",
        status: "APPROVED",
        uploadedAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
        reviewedAt: new Date(Date.now() - 20 * 60 * 60 * 1000).toISOString(),
        reviewedBy: "admin_2",
      },
      {
        _id: "doc6",
        docType: "Insurance",
        status: "APPROVED",
        uploadedAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
        reviewedAt: new Date(Date.now() - 20 * 60 * 60 * 1000).toISOString(),
        reviewedBy: "admin_2",
      },
    ],
    createdAt: new Date(Date.now() - 30 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 18 * 60 * 60 * 1000).toISOString(),
    confirmedAt: new Date(Date.now() - 18 * 60 * 60 * 1000).toISOString(),
    vehicleType: "Sedan",
    pickupTime: new Date(Date.now() + 6 * 60 * 60 * 1000).toISOString(),
    dropoffTime: new Date(Date.now() + 30 * 60 * 60 * 1000).toISOString(),
  },
  {
    _id: "64f1a2b3c4d5e6f7a8b9c0d4",
    userId: "user_101",
    location: "Pune, Maharashtra",
    address: "321 FC Road, Pune, MH 411004",
    status: "PENDING",
    priceBreakDown: {
      basePrice: 1000,
      taxes: 150,
      fees: 50,
      grandTotal: 1200,
    },
    document: [
      {
        _id: "doc7",
        docType: "License",
        status: "PENDING",
        uploadedAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
      },
      {
        _id: "doc8",
        docType: "Insurance",
        status: "PENDING",
        uploadedAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
      },
      {
        _id: "doc9",
        docType: "ID Proof",
        status: "APPROVED",
        uploadedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        reviewedAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
        reviewedBy: "admin_1",
      },
    ],
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
    vehicleType: "Hatchback",
    pickupTime: new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString(),
    dropoffTime: new Date(Date.now() + 72 * 60 * 60 * 1000).toISOString(),
  },
  {
    _id: "64f1a2b3c4d5e6f7a8b9c0d5",
    userId: "user_202",
    location: "Chennai, Tamil Nadu",
    address: "555 Anna Salai, Chennai, TN 600002",
    status: "ASSIGNED",
    priceBreakDown: {
      basePrice: 1800,
      taxes: 300,
      fees: 150,
      grandTotal: 2250,
    },
    assignedPartner: "partner_3",
    document: [
      {
        _id: "doc10",
        docType: "License",
        status: "APPROVED",
        uploadedAt: new Date(Date.now() - 10 * 60 * 60 * 1000).toISOString(),
        reviewedAt: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(),
        reviewedBy: "admin_2",
      },
      {
        _id: "doc11",
        docType: "Insurance",
        status: "PENDING",
        uploadedAt: new Date(Date.now() - 9 * 60 * 60 * 1000).toISOString(),
      },
    ],
    createdAt: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(),
    vehicleType: "SUV",
    pickupTime: new Date(Date.now() + 18 * 60 * 60 * 1000).toISOString(),
    dropoffTime: new Date(Date.now() + 42 * 60 * 60 * 1000).toISOString(),
    notes: "Customer requested child seat",
  },
  {
    _id: "64f1a2b3c4d5e6f7a8b9c0d6",
    userId: "user_303",
    location: "Hyderabad, Telangana",
    address: "777 Banjara Hills, Hyderabad, TS 500034",
    status: "CONFIRMED",
    priceBreakDown: {
      basePrice: 2000,
      taxes: 350,
      fees: 150,
      grandTotal: 2500,
    },
    assignedPartner: "partner_5",
    document: [
      {
        _id: "doc12",
        docType: "License",
        status: "APPROVED",
        uploadedAt: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString(),
        reviewedAt: new Date(Date.now() - 40 * 60 * 60 * 1000).toISOString(),
        reviewedBy: "admin_1",
      },
      {
        _id: "doc13",
        docType: "Insurance",
        status: "APPROVED",
        uploadedAt: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString(),
        reviewedAt: new Date(Date.now() - 40 * 60 * 60 * 1000).toISOString(),
        reviewedBy: "admin_1",
      },
      {
        _id: "doc14",
        docType: "ID Proof",
        status: "APPROVED",
        uploadedAt: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString(),
        reviewedAt: new Date(Date.now() - 40 * 60 * 60 * 1000).toISOString(),
        reviewedBy: "admin_1",
      },
    ],
    createdAt: new Date(Date.now() - 50 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 36 * 60 * 60 * 1000).toISOString(),
    confirmedAt: new Date(Date.now() - 36 * 60 * 60 * 1000).toISOString(),
    vehicleType: "MPV",
    pickupTime: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(),
    dropoffTime: new Date(Date.now() + 26 * 60 * 60 * 1000).toISOString(),
    notes: "Airport pickup requested",
  },
];

// Helper function to simulate API delay
export const simulateApiDelay = (ms: number = 800): Promise<void> => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};

// Mock API functions that simulate backend behavior
export const mockApi = {
  // Get all bookings
  getBookings: async (): Promise<Booking[]> => {
    await simulateApiDelay();
    return [...mockBookings];
  },

  // Get all partners
  getPartners: async (): Promise<Partner[]> => {
    await simulateApiDelay();
    return [...mockPartners];
  },

  // Assign partner to booking
  assignPartner: async (bookingId: string, partnerId: string): Promise<void> => {
    await simulateApiDelay(1000);
    const booking = mockBookings.find((b) => b._id === bookingId);
    const partner = mockPartners.find((p) => p._id === partnerId);

    if (!booking) throw new Error("Booking not found");
    if (!partner) throw new Error("Partner not found");
    if (partner.status !== "online") throw new Error("Partner is not available");

    booking.assignedPartner = partnerId;
    booking.status = "ASSIGNED";
    booking.updatedAt = new Date().toISOString();

    partner.status = "busy";
    partner.lastActiveAt = new Date().toISOString();
  },

  // Update document status
  updateDocument: async (
    bookingId: string,
    docId: string,
    status: DocumentStatus
  ): Promise<void> => {
    await simulateApiDelay(500);
    const booking = mockBookings.find((b) => b._id === bookingId);

    if (!booking) throw new Error("Booking not found");
    if (!booking.document) throw new Error("No documents found");

    const doc = booking.document.find((d) => d._id === docId);
    if (!doc) throw new Error("Document not found");

    doc.status = status;
    doc.reviewedAt = new Date().toISOString();
    doc.reviewedBy = "admin_current";
    booking.updatedAt = new Date().toISOString();
  },

  // Confirm booking
  confirmBooking: async (bookingId: string): Promise<void> => {
    await simulateApiDelay(1000);
    const booking = mockBookings.find((b) => b._id === bookingId);

    if (!booking) throw new Error("Booking not found");
    if (booking.status !== "ASSIGNED") throw new Error("Booking must be assigned first");
    if (!booking.document?.every((d) => d.status === "APPROVED")) {
      throw new Error("All documents must be approved");
    }

    booking.status = "CONFIRMED";
    booking.confirmedAt = new Date().toISOString();
    booking.updatedAt = new Date().toISOString();
  },
};