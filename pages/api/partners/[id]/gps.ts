import { NextApiRequest, NextApiResponse } from "next";
import { getDatabase } from "@/lib/mongodb";
import redis from "@/lib/redis";
import { ObjectId } from "mongodb";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { id } = req.query;
  const { lat, lng } = req.body;

  // Validate inputs
  if (!id || typeof id !== 'string' || !ObjectId.isValid(id)) {
    return res.status(400).json({ error: 'Valid Partner ID is required' });
  }

  if (lat === undefined || lng === undefined || typeof lat !== 'number' || typeof lng !== 'number') {
    return res.status(400).json({ error: 'Valid latitude and longitude are required' });
  }

  try {
    // Rate limit: max 6 updates per minute per partner
    const rateLimitKey = `partner:${id}:gps`;
    const count = await redis.incr(rateLimitKey);
    
    if (count === 1) {
      await redis.expire(rateLimitKey, 60);
    }
    
    if (count > 6) {
      return res.status(429).json({ error: "Rate limit exceeded. Max 6 updates per minute." });
    }

    // Update partner location in MongoDB
    const db = await getDatabase();
    const result = await db.collection("partners").updateOne(
      { _id: new ObjectId(id) },
      {
        $set: {
          'location.lat': lat,
          'location.lng': lng,
          lastActiveAt: new Date()
        }
      }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({ error: 'Partner not found' });
    }

    // Publish to Redis pub/sub for real-time tracking
    await redis.publish("partner:gps", JSON.stringify({
      partnerId: id,
      lat,
      lng,
      timestamp: new Date().toISOString()
    }));

    res.status(200).json({ success: true, message: 'GPS location updated successfully' });
  } catch (error) {
    console.error('GPS update error:', error);
    res.status(500).json({ error: 'Failed to update GPS location' });
  }
}
