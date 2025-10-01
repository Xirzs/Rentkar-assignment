import { NextApiRequest } from 'next';
import { Server as WebSocketServer, WebSocket } from 'ws';
import Redis from 'ioredis';

const redis = new Redis({
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379'),
});

// Keep a single wss instance for hot reloads
let wss: WebSocketServer;

export default function handler(req: NextApiRequest, res: any) {
  if (res.socket.server.wss) {
    console.log('WebSocket server already running');
    res.end();
    return;
  }

  wss = new WebSocketServer({ server: res.socket.server });

  wss.on('connection', (ws: WebSocket) => {
    console.log('New client connected');

    ws.on('close', () => {
      console.log('Client disconnected');
    });

    ws.on('error', (error: Error) => {
      console.error('WebSocket client error:', error);
    });
  });

  // Subscribe to Redis partner:gps channel
  redis.subscribe('partner:gps', (err) => {
    if (err) {
      console.error('Failed to subscribe to partner:gps channel', err);
      return;
    }
    console.log('Subscribed to partner:gps channel');
  });

  redis.on('message', (channel: string, message: string) => {
    if (channel === 'partner:gps') {
      console.log('Broadcasting GPS update:', message);
      // Broadcast message to all connected clients
      wss.clients.forEach((client: WebSocket) => {
        if (client.readyState === WebSocket.OPEN) {
          client.send(message);
        }
      });
    }
  });

  redis.on('error', (err) => {
    console.error('Redis error:', err);
  });

  res.socket.server.wss = wss;
  console.log('WebSocket server started');
  res.end();
}