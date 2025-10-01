// pages/api/bookings/[id]/documents/[docId].ts
import { NextApiRequest, NextApiResponse } from 'next';
import { ObjectId } from 'mongodb';
import { getDatabase } from '../../../../../lib/mongodb';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  console.log('=== DOCUMENT API CALLED ===');
  console.log('Method:', req.method);
  console.log('Query:', req.query);
  console.log('Body:', req.body);

  if (req.method !== 'PATCH') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { id, docId } = req.query;

  if (!id || typeof id !== 'string' || !ObjectId.isValid(id)) {
    return res.status(400).json({ message: 'Valid Booking ID is required' });
  }

  if (!docId || typeof docId !== 'string') {
    return res.status(400).json({ message: 'Valid Document ID is required' });
  }

  const { status } = req.body;

  if (!status || !['APPROVED', 'REJECTED', 'PENDING'].includes(status)) {
    return res.status(400).json({ message: 'Valid status is required' });
  }

  try {
    const db = await getDatabase();

    const booking = await db.collection('bookings').findOne({ _id: new ObjectId(id) });
    console.log('Booking found:', booking ? 'Yes' : 'No');

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    if (!booking.document || !Array.isArray(booking.document)) {
      return res.status(404).json({ message: 'No documents in booking' });
    }

    console.log('Documents:', booking.document);
    console.log('Looking for docId:', docId);

    const docIndex = booking.document.findIndex((doc: any) => String(doc._id) === String(docId));
    console.log('Document index:', docIndex);

    if (docIndex === -1) {
      return res.status(404).json({ message: 'Document not found in booking' });
    }

    const updateField = `document.${docIndex}.status`;
    
    await db.collection('bookings').updateOne(
      { _id: new ObjectId(id) },
      { 
        $set: { 
          [updateField]: status,
          updatedAt: new Date()
        } 
      }
    );

    console.log('Document updated successfully');
    res.status(200).json({ message: `Document ${status.toLowerCase()} successfully` });
  } catch (error) {
    console.error('Error updating document:', error);
    res.status(500).json({
      message: error instanceof Error ? error.message : 'Internal server error',
    });
  }
}