// pages/api/bookings/[id]/assign.ts
import { NextApiRequest, NextApiResponse } from 'next';
import { ObjectId } from 'mongodb';
import { getDatabase } from '../../../../lib/mongodb';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { id } = req.query;
  const { partnerId } = req.body;

  console.log('=== ASSIGNMENT API CALLED ===');
  console.log('Assignment request:', { id, partnerId });

  if (!id || typeof id !== 'string' || !ObjectId.isValid(id)) {
    return res.status(400).json({ message: 'Valid Booking ID is required' });
  }

  if (!partnerId || typeof partnerId !== 'string' || !ObjectId.isValid(partnerId)) {
    return res.status(400).json({ message: 'Valid Partner ID is required' });
  }

  try {
    const db = await getDatabase();

    // Fetch booking
    const booking = await db.collection('bookings').findOne({ _id: new ObjectId(id) });

    if (!booking) {
      console.log('Booking not found');
      return res.status(404).json({ message: 'Booking not found' });
    }

    console.log('Full booking document:', JSON.stringify(booking, null, 2));
    console.log('Booking status field:', booking.status);
    console.log('Booking status type:', typeof booking.status);

    // Handle missing or undefined status - check for common field names
    let currentStatus = booking.status || booking.bookingStatus || booking.state;
    
    if (!currentStatus) {
      console.log('Status field is missing or undefined');
      return res.status(400).json({ 
        message: 'Booking status is missing from the database. Please ensure the booking has a valid status.',
        bookingId: id,
        availableFields: Object.keys(booking)
      });
    }

    // Normalize status to uppercase for comparison
    const normalizedStatus = String(currentStatus).toUpperCase();
    console.log('Normalized status:', normalizedStatus);

    if (normalizedStatus !== 'PENDING') {
      console.log(`Cannot assign - status is ${normalizedStatus}`);
      return res.status(400).json({ 
        message: `Booking cannot be assigned. Current status: ${currentStatus}` 
      });
    }

    if (booking.partnerId) {
      console.log('Booking already has partner:', booking.partnerId);
      return res.status(400).json({ message: 'Booking already has an assigned partner' });
    }

    // Fetch partner
    const partner = await db.collection('partners').findOne({ _id: new ObjectId(partnerId) });

    if (!partner) {
      console.log('Partner not found');
      return res.status(404).json({ message: 'Partner not found' });
    }

    console.log('Partner status:', partner.status);

    if (partner.status !== 'online') {
      return res.status(400).json({ message: `Partner is not available. Current status: ${partner.status}` });
    }

    console.log('Updating booking to ASSIGNED status...');
    
    // Update booking
    const updateResult = await db.collection('bookings').updateOne(
      { _id: new ObjectId(id) },
      {
        $set: {
          partnerId,
          status: 'ASSIGNED',
          updatedAt: new Date()
        }
      }
    );

    console.log('Booking update result:', updateResult);

    // Update partner
    await db.collection('partners').updateOne(
      { _id: new ObjectId(partnerId) },
      {
        $set: {
          status: 'busy',
          lastActiveAt: new Date()
        }
      }
    );

    console.log('Assignment completed successfully');

    return res.status(200).json({
      message: 'Partner assigned successfully',
      success: true
    });

  } catch (error) {
    console.error('Error assigning partner:', error);
    const errorMessage = error instanceof Error ? error.message : 'Internal server error';
    return res.status(500).json({
      message: errorMessage,
      error: process.env.NODE_ENV === 'development' ? String(error) : undefined
    });
  }
}