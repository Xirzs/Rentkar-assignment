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
      return res.status(404).json({ message: 'Booking not found' });
    }

    if (booking.status !== 'PENDING') {
      return res.status(400).json({ message: `Booking cannot be assigned. Current status: ${booking.status}` });
    }

    if (booking.partnerId) {
      return res.status(400).json({ message: 'Booking already has an assigned partner' });
    }

    // Fetch partner
    const partner = await db.collection('partners').findOne({ _id: new ObjectId(partnerId) });

    if (!partner) {
      return res.status(404).json({ message: 'Partner not found' });
    }

    if (partner.status !== 'online') {
      return res.status(400).json({ message: `Partner is not available. Current status: ${partner.status}` });
    }

    // Update booking
    await db.collection('bookings').updateOne(
      { _id: new ObjectId(id) },
      {
        $set: {
          partnerId,
          status: 'ASSIGNED',
          updatedAt: new Date()
        }
      }
    );

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