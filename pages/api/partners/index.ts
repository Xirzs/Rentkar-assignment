// pages/api/partners/index.ts
import { NextApiRequest, NextApiResponse } from 'next';
import { getDatabase } from '../../../lib/mongodb';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const db = await getDatabase();
    const partners = await db
      .collection('partners')
      .find({})
      .sort({ lastActiveAt: -1 })
      .toArray();

    // Deep serialize all data
    const serializedPartners = JSON.parse(JSON.stringify(partners, (key, value) => {
      if (value && typeof value === 'object' && value._bsontype === 'ObjectID') {
        return value.toString();
      }
      if (value instanceof Date) {
        return value.toISOString();
      }
      return value;
    }));

    res.status(200).json({ partners: serializedPartners });
  } catch (error) {
    console.error('Error fetching partners:', error);
    res.status(500).json({
      message: 'Internal server error',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}