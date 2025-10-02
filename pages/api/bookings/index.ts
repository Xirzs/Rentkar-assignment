// pages/api/bookings/index.ts
import { NextApiRequest, NextApiResponse } from 'next';
import { getDatabase } from '../../../lib/mongodb';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const db = await getDatabase();

    const bookings = await db
      .collection('bookings')
      .find({})
      .sort({ createdAt: -1 })
      .toArray();

    // Serialize the data to plain objects
    const serializedBookings = bookings.map(booking => ({
      ...booking,
      _id: booking._id.toString(),
      partnerId: booking.partnerId?.toString(),
      createdAt: booking.createdAt instanceof Date ? booking.createdAt.toISOString() : booking.createdAt,
      updatedAt: booking.updatedAt instanceof Date ? booking.updatedAt.toISOString() : booking.updatedAt,
      pickupTime: booking.pickupTime instanceof Date ? booking.pickupTime.toISOString() : booking.pickupTime,
    }));

    res.status(200).json({ bookings: serializedBookings });
  } catch (error) {
    console.error('Error fetching bookings:', error);
    res.status(500).json({ 
      message: 'Internal server error',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}