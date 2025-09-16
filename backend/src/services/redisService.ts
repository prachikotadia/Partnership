import Redis from 'ioredis';

let redis: Redis;

export const initializeRedis = async () => {
  try {
    redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379', {
      retryDelayOnFailover: 100,
      enableReadyCheck: false,
      maxRetriesPerRequest: null,
    });

    redis.on('connect', () => {
      console.log('✅ Redis connected successfully');
    });

    redis.on('error', (error) => {
      console.error('❌ Redis connection error:', error);
    });

    // Test connection
    await redis.ping();
    
    return redis;
  } catch (error) {
    console.error('❌ Redis connection failed:', error);
    throw error;
  }
};

export const getRedis = () => {
  if (!redis) {
    throw new Error('Redis not initialized');
  }
  return redis;
};

// Cache utilities
export const cache = {
  async get(key: string): Promise<string | null> {
    try {
      return await redis.get(key);
    } catch (error) {
      console.error('Redis get error:', error);
      return null;
    }
  },

  async set(key: string, value: string, ttl?: number): Promise<void> {
    try {
      if (ttl) {
        await redis.setex(key, ttl, value);
      } else {
        await redis.set(key, value);
      }
    } catch (error) {
      console.error('Redis set error:', error);
    }
  },

  async del(key: string): Promise<void> {
    try {
      await redis.del(key);
    } catch (error) {
      console.error('Redis del error:', error);
    }
  },

  async exists(key: string): Promise<boolean> {
    try {
      const result = await redis.exists(key);
      return result === 1;
    } catch (error) {
      console.error('Redis exists error:', error);
      return false;
    }
  },

  async expire(key: string, ttl: number): Promise<void> {
    try {
      await redis.expire(key, ttl);
    } catch (error) {
      console.error('Redis expire error:', error);
    }
  },

  async keys(pattern: string): Promise<string[]> {
    try {
      return await redis.keys(pattern);
    } catch (error) {
      console.error('Redis keys error:', error);
      return [];
    }
  }
};

// Session management
export const session = {
  async create(userId: string, sessionData: any, ttl: number = 86400): Promise<string> {
    const sessionId = `session:${userId}:${Date.now()}`;
    await cache.set(sessionId, JSON.stringify(sessionData), ttl);
    return sessionId;
  },

  async get(sessionId: string): Promise<any> {
    const data = await cache.get(sessionId);
    return data ? JSON.parse(data) : null;
  },

  async destroy(sessionId: string): Promise<void> {
    await cache.del(sessionId);
  },

  async destroyAll(userId: string): Promise<void> {
    const keys = await cache.keys(`session:${userId}:*`);
    if (keys.length > 0) {
      await redis.del(...keys);
    }
  }
};

// Rate limiting
export const rateLimit = {
  async check(key: string, limit: number, window: number): Promise<{ allowed: boolean; remaining: number; resetTime: number }> {
    const current = await redis.incr(key);
    
    if (current === 1) {
      await redis.expire(key, window);
    }
    
    const ttl = await redis.ttl(key);
    const resetTime = Date.now() + (ttl * 1000);
    
    return {
      allowed: current <= limit,
      remaining: Math.max(0, limit - current),
      resetTime
    };
  }
};
