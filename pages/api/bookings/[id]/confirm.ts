// pages/api/bookings/[id]/confirm.ts
import { NextApiRequest, NextApiResponse } from 'next';
import { ObjectId } from 'mongodb';
import { getDatabase } from '../../../../lib/mongodb';
import { withLock } from '../../../../lib/redis';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { id } = req.query;

  if (!id || typeof id !== 'string' || !ObjectId.isValid(id)) {
    return res.status(400).json({ message: 'Valid Booking ID is required' });
  }

  try {
    const result = await withLock(
      `booking:confirm:${id}`,
      async () => {
        const db = await getDatabase();

        const booking = await db.collection('bookings').findOne({ _id: new ObjectId(id) });
        if (!booking) throw new Error('Booking not found');

        console.log('Booking data:', JSON.stringify(booking, null, 2)); // Debug log

        // Check for either partnerId or assignedPartner field
        const hasPartner = booking.partnerId || booking.assignedPartner;
        if (!hasPartner) throw new Error('Booking must have an assigned partner');

        if (booking.status !== 'ASSIGNED') {
          throw new Error(`Booking must be assigned first. Current status: ${booking.status}`);
        }

        // Check documents
        if (!booking.document || !Array.isArray(booking.document)) {
          throw new Error('No documents found');
        }

        const allDocsApproved = booking.document.every((d: any) => d.status === 'APPROVED');
        if (!allDocsApproved) {
          const pendingDocs = booking.document.filter((d: any) => d.status !== 'APPROVED');
          throw new Error(`All documents must be approved. Pending: ${pendingDocs.map((d: any) => d.docType).join(', ')}`);
        }

        await db.collection('bookings').updateOne(
          { _id: new ObjectId(id) },
          {
            $set: {
              status: 'CONFIRMED',
              confirmedAt: new Date(),
              updatedAt: new Date()
            }
          }
        );

        return { success: true };
      },
      {
        timeout: 30000, // 30 seconds in milliseconds
        retryDelay: 100,
        maxRetries: 50
      }
    );

    res.status(200).json({
      message: 'Booking confirmed successfully',
      success: true
    });
  } catch (error) {
    console.error('Error confirming booking:', error);
    res.status(500).json({
      message: error instanceof Error ? error.message : 'Internal server error'
    });
  }
}