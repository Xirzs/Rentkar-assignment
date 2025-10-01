export interface Document {
  _id?: string;
  docType: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  uploadedAt?: Date;
  reviewedAt?: Date;
  reviewedBy?: string;
}

export interface Booking {
  _id?: string;
  userId: string;
  location: string;
  address: string;
  status: 'PENDING' | 'ASSIGNED' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED';
  priceBreakDown: {
    basePrice: number;
    taxes: number;
    fees: number;
    grandTotal: number;
  };
  assignedPartner?: string;
  document?: Document[];
  createdAt: Date;
  updatedAt: Date;
  confirmedAt?: Date;
  
  // Additional fields for future use
  pickupTime?: Date;
  dropoffTime?: Date;
  vehicleType?: string;
  notes?: string;
}

// Helper functions for booking operations
export const BookingHelpers = {
  canAssignPartner: (booking: Booking): boolean => {
    return booking.status === 'PENDING' && !booking.assignedPartner;
  },
  
  canConfirm: (booking: Booking): boolean => {
    return (
      booking.status === 'ASSIGNED' &&
      booking.assignedPartner &&
      booking.document?.every(d => d.status === 'APPROVED')
    );
  },
  
  getAllPendingDocuments: (booking: Booking): Document[] => {
    return booking.document?.filter(d => d.status === 'PENDING') || [];
  }
};