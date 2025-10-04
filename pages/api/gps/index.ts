// pages/api/gps/index.ts
import { NextApiRequest, NextApiResponse } from 'next';
import { getDatabase } from '@/lib/mongodb';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const db = await getDatabase();
    const partners = await db.collection('partners').find({}).toArray();

    const gps = partners
      .filter(p => p.currentLocation?.coordinates)
      .map(p => ({
        id: p._id.toString(),
        name: p.name,
        lat: p.currentLocation.coordinates[1],
        lng: p.currentLocation.coordinates[0],
        updatedAt: p.lastUpdated || new Date().toISOString()
      }));

    res.status(200).json({ gps });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch GPS data' });
  }
}