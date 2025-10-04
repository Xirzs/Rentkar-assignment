// lib/redis.ts
import Redis from 'ioredis';

const REDIS_URL = process.env.REDIS_URL || 'redis://localhost:6379';

let cachedRedis: Redis | null = null;

export async function getRedisClient(): Promise<Redis> {
  if (cachedRedis && cachedRedis.status === 'ready') {
    return cachedRedis;
  }

  try {
    const redis = new Redis(REDIS_URL, {
      maxRetriesPerRequest: 3,
      enableReadyCheck: true,
      retryStrategy(times) {
        const delay = Math.min(times * 50, 2000);
        return delay;
      },
      reconnectOnError(err) {
        const targetError = 'READONLY';
        if (err.message.includes(targetError)) {
          return true;
        }
        return false;
      }
    });

    redis.on('connect', () => {
      console.log('✅ Redis connected');
    });

    redis.on('ready', () => {
      console.log('✅ Redis ready');
    });

    redis.on('error', (err) => {
      console.error('❌ Redis error:', err);
    });

    // Wait for connection
    await new Promise((resolve, reject) => {
      redis.once('ready', resolve);
      redis.once('error', reject);
      setTimeout(() => reject(new Error('Redis connection timeout')), 5000);
    });

    cachedRedis = redis;
    return redis;
  } catch (error) {
    console.error('Redis connection error:', error);
    throw error;
  }
}

export async function closeRedisClient(): Promise<void> {
  if (cachedRedis) {
    await cachedRedis.quit();
    cachedRedis = null;
  }
}