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

// Distributed lock implementation
export async function withLock<T>(
  key: string,
  callback: () => Promise<T>,
  options: {
    timeout?: number; // Lock timeout in milliseconds
    retryDelay?: number; // Delay between retries in milliseconds
    maxRetries?: number; // Maximum number of retries
  } = {}
): Promise<T> {
  const {
    timeout = 5000, // 5 seconds default
    retryDelay = 100, // 100ms default
    maxRetries = 50, // 50 retries default
  } = options;

  const redis = await getRedisClient();
  const lockKey = `lock:${key}`;
  const lockValue = `${Date.now()}-${Math.random()}`;
  const lockExpiry = Math.ceil(timeout / 1000); // Convert to seconds

  let retries = 0;

  // Try to acquire the lock
  while (retries < maxRetries) {
    const acquired = await redis.set(lockKey, lockValue, 'EX', lockExpiry, 'NX');

    if (acquired === 'OK') {
      try {
        // Lock acquired, execute the callback
        return await callback();
      } finally {
        // Release the lock only if we still own it
        const currentValue = await redis.get(lockKey);
        if (currentValue === lockValue) {
          await redis.del(lockKey);
        }
      }
    }

    // Lock not acquired, wait and retry
    retries++;
    if (retries < maxRetries) {
      await new Promise((resolve) => setTimeout(resolve, retryDelay));
    }
  }

  throw new Error(`Failed to acquire lock for key: ${key} after ${maxRetries} retries`);
}

// Alternative simpler version if you don't need retry logic
export async function withLockSimple<T>(
  key: string,
  callback: () => Promise<T>,
  timeoutSeconds: number = 5
): Promise<T> {
  const redis = await getRedisClient();
  const lockKey = `lock:${key}`;
  const lockValue = `${Date.now()}-${Math.random()}`;

  const acquired = await redis.set(lockKey, lockValue, 'EX', timeoutSeconds, 'NX');

  if (acquired !== 'OK') {
    throw new Error(`Failed to acquire lock for key: ${key}`);
  }

  try {
    return await callback();
  } finally {
    const currentValue = await redis.get(lockKey);
    if (currentValue === lockValue) {
      await redis.del(lockKey);
    }
  }
}