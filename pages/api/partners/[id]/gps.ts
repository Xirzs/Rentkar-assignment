// pages/api/partners/[id]/gps.ts
import { NextApiRequest, NextApiResponse } from 'next';
import { getDatabase } from '@/lib/mongodb';
import { getRedisClient } from '@/lib/redis';
import { Types } from 'mongoose';


async function checkRateLimit(
  redis: any, 
  key: string, 
  limit: number, 
  window: number
): Promise<{ allowed: boolean; remaining: number }> {
  const now = Date.now();
  const windowStart = now - window;
  
  // Remove old entries outside the time window
  await redis.zremrangebyscore(key, 0, windowStart);
  
  // Count current requests in window
  const currentCount = await redis.zcard(key);
  
  if (currentCount >= limit) {
    return { allowed: false, remaining: 0 };
  }
  
  // Add new request
  await redis.zadd(key, now, `${now}-${Math.random()}`);
  await redis.expire(key, Math.ceil(window / 1000));
  
  return { 
    allowed: true, 
    remaining: limit - currentCount - 1 
  };
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { id } = req.query;
  const partnerId = typeof id === 'string' ? id : id?.[0];
  const { lat, lng } = req.body;

  if (!partnerId) {
    return res.status(400).json({ error: 'Partner ID is required' });
  }

  if (typeof lat !== 'number' || typeof lng !== 'number') {
    return res.status(400).json({ 
      error: 'Valid latitude and longitude are required',
      received: { lat, lng }
    });
  }

  try {
    const redis = await getRedisClient();
    
    // Rate limit: max 6 updates per minute per partner
    const rateKey = `gps-updates:${partnerId}`;
    const { allowed, remaining } = await checkRateLimit(redis, rateKey, 6, 60000);
    
    if (!allowed) {
      return res.status(429).json({ 
        error: 'Rate limit exceeded. Maximum 6 GPS updates per minute allowed.',
        remaining: 0,
        retryAfter: 60
      });
    }

    // Update partner location in MongoDB
    const db = await getDatabase();
    const partnersCollection = db.collection('partners');

    const updateResult = await partnersCollection.updateOne(
      {_id: new Types.ObjectId(partnerId)
},
      { 
        $set: { 
          location: { lat, lng },
          lastGpsUpdate: new Date()
        } 
      }
    );

    if (updateResult.matchedCount === 0) {
      return res.status(404).json({ error: 'Partner not found' });
    }

    // Broadcast GPS update via Redis pub/sub
    await redis.publish('partner:gps-update', JSON.stringify({
      partnerId,
      location: { lat, lng },
      timestamp: new Date().toISOString()
    }));

    return res.status(200).json({
      success: true,
      message: 'GPS location updated successfully',
      partnerId,
      location: { lat, lng },
      remaining,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error updating GPS location:', error);
    return res.status(500).json({ 
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}