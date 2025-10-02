// lib/redis.ts
import { Redis } from '@upstash/redis';

// Use REST variables if available, fall back to regular variables
const redisUrl = process.env.UPSTASH_REDIS_REST_URL || process.env.UPSTASH_REDIS_URL;
const redisToken = process.env.UPSTASH_REDIS_REST_TOKEN || process.env.UPSTASH_REDIS_TOKEN;

if (!redisUrl || !redisToken) {
  console.error('❌ Missing Redis configuration. Available env vars:', {
    hasRestUrl: !!process.env.UPSTASH_REDIS_REST_URL,
    hasUrl: !!process.env.UPSTASH_REDIS_URL,
    hasRestToken: !!process.env.UPSTASH_REDIS_REST_TOKEN,
    hasToken: !!process.env.UPSTASH_REDIS_TOKEN,
  });
  throw new Error('Redis configuration missing');
}

const redis = new Redis({
  url: redisUrl,
  token: redisToken,
});

console.log('✅ Upstash Redis configured with URL:', redisUrl);

export default redis;

// Helper function for distributed locks
export const withLock = async <T>(
  lockKey: string,
  fn: () => Promise<T>,
  ttlSeconds = 30
): Promise<T> => {
  const lockValue = `${Date.now()}-${Math.random()}`;
  
  try {
    const acquired = await redis.set(lockKey, lockValue, {
      nx: true,
      ex: ttlSeconds,
    });
    
    if (!acquired) {
      throw new Error('Could not acquire lock. Another operation is in progress.');
    }
    
    try {
      return await fn();
    } finally {
      const currentValue = await redis.get(lockKey);
      if (currentValue === lockValue) {
        await redis.del(lockKey);
      }
    }
  } catch (error) {
    console.error('❌ Redis lock error:', error);
    throw error;
  }
};