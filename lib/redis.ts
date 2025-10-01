// lib/redis.ts
import { Redis } from '@upstash/redis';

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

console.log('✅ Upstash Redis configured');

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