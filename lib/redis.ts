// lib/redis.ts
import Redis from 'ioredis';

const redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379', {
  maxRetriesPerRequest: 3,
  retryStrategy: (times) => {
    const delay = Math.min(times * 50, 2000);
    return delay;
  },
});

redis.on('connect', () => {
  console.log('✅ Redis connected');
});

redis.on('error', (error) => {
  console.error('❌ Redis connection error:', error);
});

export default redis;

// Helper function for distributed locks
export const withLock = async <T>(
  lockKey: string,
  fn: () => Promise<T>,
  ttlSeconds = 30
): Promise<T> => {
  const lockValue = `${Date.now()}-${Math.random()}`;
  
  // Try to acquire lock
  const acquired = await redis.set(lockKey, lockValue, 'EX', ttlSeconds, 'NX');
  
  if (!acquired) {
    throw new Error('Could not acquire lock. Another operation is in progress.');
  }
  
  try {
    // Execute the function
    return await fn();
  } finally {
    // Release lock only if we still own it
    const script = `
      if redis.call("get", KEYS[1]) == ARGV[1] then
        return redis.call("del", KEYS[1])
      else
        return 0
      end
    `;
    await redis.eval(script, 1, lockKey, lockValue);
  }
};