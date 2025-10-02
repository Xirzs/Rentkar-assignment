// pages/api/bookings/[id]/assign.ts
import { NextApiRequest, NextApiResponse } from 'next';
import { ObjectId } from 'mongodb';
import { getDatabase } from '../../../../lib/mongodb';
import { withLock } from '../../../../lib/redis';

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
    // Check if withLock is available
    if (typeof withLock !== 'function') {
      console.error('withLock is not a function, proceeding without lock');
      // Fallback: proceed without Redis lock if it's not available
      return await assignPartnerWithoutLock(id, partnerId, res);
    }

    const result = await withLock(
      `booking:assign:${id}`,
      async () => {
        return await assignPartnerLogic(id, partnerId);
      },
      30
    );

    res.status(200).json({
      message: 'Partner assigned successfully',
      success: true
    });
  } catch (error) {
    console.error('Error assigning partner:', error);
    const errorMessage = error instanceof Error ? error.message : 'Internal server error';
    res.status(500).json({
      message: errorMessage,
      error: process.env.NODE_ENV === 'development' ? String(error) : undefined
    });
  }
}

// Extracted assignment logic
async function assignPartnerLogic(id: string, partnerId: string) {
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
}

// Fallback without Redis lock
async function assignPartnerWithoutLock(id: string, partnerId: string, res: NextApiResponse) {
  try {
    await assignPartnerLogic(id, partnerId);
    res.status(200).json({
      message: 'Partner assigned successfully (without lock)',
      success: true
    });
  } catch (error) {
    console.error('Error in fallback assignment:', error);
    const errorMessage = error instanceof Error ? error.message : 'Internal server error';
    res.status(500).json({
      message: errorMessage
    });
  }
}