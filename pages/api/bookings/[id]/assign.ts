// pages/api/bookings/[id]/assign.ts
import { NextApiRequest, NextApiResponse } from 'next';
import { ObjectId } from 'mongodb';
import { getDatabase } from '../../../../lib/mongodb';
import { withLock } from '../../../../lib/redis';

console.log('withLock function:', typeof withLock); // Add this line to debug

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { id } = req.query;
  const { partnerId } = req.body;

  if (!id || typeof id !== 'string' || !ObjectId.isValid(id)) {
    return res.status(400).json({ message: 'Valid Booking ID is required' });
  }

  if (!partnerId || typeof partnerId !== 'string' || !ObjectId.isValid(partnerId)) {
    return res.status(400).json({ message: 'Valid Partner ID is required' });
  }

  try {
    const result = await withLock(
      `booking:assign:${id}`,
      async () => {
        const db = await getDatabase();

        const booking = await db.collection('bookings').findOne({ _id: new ObjectId(id) });

        if (!booking) {
          throw new Error('Booking not found');
        }

        if (booking.status !== 'PENDING') {
          throw new Error(`Booking cannot be assigned. Current status: ${booking.status}`);
        }

        if (booking.partnerId) {
          throw new Error('Booking already has an assigned partner');
        }

        const partner = await db.collection('partners').findOne({ _id: new ObjectId(partnerId) });

        if (!partner) {
          throw new Error('Partner not found');
        }

        if (partner.status !== 'online') {
          throw new Error(`Partner is not available. Current status: ${partner.status}`);
        }

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

        await db.collection('partners').updateOne(
          { _id: new ObjectId(partnerId) },
          {
            $set: {
              status: 'busy',
              lastActiveAt: new Date()
            }
          }
        );

        return { success: true };
      },
      30
    );

   res.status(200).json({
  message: 'Partner assigned successfully',
  success: true
});
  } catch (error) {
    console.error('Error assigning partner:', error);
    res.status(500).json({
      message: error instanceof Error ? error.message : 'Internal server error'
    });
  }
}