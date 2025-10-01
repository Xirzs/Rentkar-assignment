import { NextApiRequest } from 'next';
import { WebSocketServer } from 'ws';
import type { WebSocket } from 'ws';
import redis from '@/lib/redis';

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

  // Note: Upstash Redis REST API doesn't support pub/sub directly
  // You'll need to use polling or a different approach for real-time updates
  // For now, we'll skip the Redis pub/sub setup
  
  res.end();
}