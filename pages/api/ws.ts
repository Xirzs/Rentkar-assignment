import { NextApiRequest } from 'next';
import { WebSocketServer } from 'ws';
import type { WebSocket } from 'ws';
import { getRedisClient } from '@/lib/redis'; // Changed from default import

// Keep a single wss instance for hot reloads
let wss: WebSocketServer;

export default function handler(req: NextApiRequest, res: any) {
  if (res.socket.server.wss) {
    console.log('WebSocket server already running');
    res.end();
    return;
  }

  wss = new WebSocketServer({ server: res.socket.server });
  res.socket.server.wss = wss;

  console.log('WebSocket server started');

  wss.on('connection', (ws: WebSocket) => {
    console.log('New client connected');

    ws.on('close', () => {
      console.log('Client disconnected');
    });

    ws.on('error', (error: Error) => {
      console.error('WebSocket client error:', error);
    });
  });

  // Note: Upstash Redis REST API doesn't support pub/sub
  // You'll need to implement polling or use a different approach
  // For now, commenting out the Redis subscription code
  
  /*
  // If you need real-time updates, consider:
  // 1. Polling Redis at intervals
  // 2. Using Upstash Redis with TCP (not REST)
  // 3. Using a different pub/sub service
  */

  res.end();
}