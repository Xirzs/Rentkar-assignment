// pages/api/bookings/[id]/documents/[docType].ts
// RENAME FILE FROM [docId].ts TO [docType].ts
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

  const { id, docType } = req.query;

  if (!id || typeof id !== 'string' || !ObjectId.isValid(id)) {
    return res.status(400).json({ message: 'Valid Booking ID is required' });
  }

  if (!docType || typeof docType !== 'string' || docType === 'undefined') {
    return res.status(400).json({ message: 'Valid Document Type is required' });
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
    console.log('Looking for docType:', docType);

    // Find document by docType instead of _id
    const docIndex = booking.document.findIndex((doc: any) => doc.docType === docType);
    console.log('Document index:', docIndex);

    if (docIndex === -1) {
      return res.status(404).json({ 
        message: `Document with type ${docType} not found in booking`,
        availableTypes: booking.document.map((d: any) => d.docType)
      });
    }

    const updateField = `document.${docIndex}.status`;
    
    const updateResult = await db.collection('bookings').updateOne(
      { _id: new ObjectId(id) },
      { 
        $set: { 
          [updateField]: status,
          updatedAt: new Date()
        } 
      }
    );

    console.log('Update result:', updateResult);

    res.status(200).json({
      message: 'Document status updated successfully',
      success: true,
      docType,
      newStatus: status
    });
  } catch (error) {
    console.error('Error updating document:', error);
    res.status(500).json({
      message: error instanceof Error ? error.message : 'Internal server error',
    });
  }
}