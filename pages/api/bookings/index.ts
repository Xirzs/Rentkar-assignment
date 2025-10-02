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

    // Deep serialize all data including nested objects
    const serializedBookings = JSON.parse(JSON.stringify(bookings, (key, value) => {
      if (value && typeof value === 'object' && value._bsontype === 'ObjectID') {
        return value.toString();
      }
      if (value instanceof Date) {
        return value.toISOString();
      }
      return value;
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