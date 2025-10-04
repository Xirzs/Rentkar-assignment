// pages/api/sse.ts
import { NextApiRequest, NextApiResponse } from 'next';
import { getRedisClient } from '@/lib/redis';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Set headers for SSE
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache, no-transform');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('X-Accel-Buffering', 'no');

  // Send initial connection message
  res.write(
    `data: ${JSON.stringify({ type: 'connected', message: 'SSE connection established' })}\n\n`
  );

  let subscriber: Awaited<ReturnType<typeof getRedisClient>> | null = null;
  let heartbeatInterval: NodeJS.Timeout | null = null;

  try {
    const redis = await getRedisClient();
    subscriber = await redis.duplicate();
    await subscriber.connect();

    // Subscribe to channels
    await subscriber.subscribe('partner:gps-update');
    await subscriber.subscribe('booking:confirmed');

    // Set up message listener
    subscriber.on('message', (channel: string, message: string) => {
      try {
        const data = JSON.parse(message);
        
        if (channel === 'partner:gps-update') {
          res.write(
            `data: ${JSON.stringify({ type: 'partner:gps-update', ...data })}\n\n`
          );
        } else if (channel === 'booking:confirmed') {
          res.write(
            `data: ${JSON.stringify({ type: 'booking:confirmed', ...data })}\n\n`
          );
        }
      } catch (err) {
        console.error(`Error parsing message from ${channel}:`, err);
      }
    });

    // Heartbeat to keep connection alive
    heartbeatInterval = setInterval(() => {
      res.write(`data: ${JSON.stringify({ type: 'heartbeat' })}\n\n`);
    }, 30000);

    // Clean up on client disconnect
    req.on('close', async () => {
      if (heartbeatInterval) clearInterval(heartbeatInterval);
      if (subscriber) {
        await subscriber.unsubscribe();
        await subscriber.quit();
      }
      res.end();
    });
  } catch (error) {
    console.error('SSE setup error:', error);
    res.write(
      `data: ${JSON.stringify({
        type: 'error',
        message: error instanceof Error ? error.message : String(error ?? 'Unknown error'),
      })}\n\n`
    );
    res.end();
  }
}

export const config = {
  api: {
    bodyParser: false,
    responseLimit: false,
  },
};