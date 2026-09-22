import Redis from 'ioredis';
import RedisMock from 'ioredis-mock';
import { env } from './env';
import { logger } from './logger';

let redisClient: Redis;

export function getRedisClient(): Redis {
  if (redisClient) {
    return redisClient;
  }

  if (env.NODE_ENV === 'test') {
    redisClient = new RedisMock() as unknown as Redis;
    return redisClient;
  }

  try {
    const client = new Redis(env.REDIS_URL, {
      maxRetriesPerRequest: 1,
      connectTimeout: 2000,
      lazyConnect: true,
      retryStrategy: (times) => {
        if (times > 2) return null; // stop retrying quickly
        return 500;
      },
    });

    client.on('error', (err) => {
      logger.warn(`Redis connection error: ${err.message}. Using fallback in-memory store.`);
    });

    // Attempt connection
    client
      .connect()
      .then(() => {
        logger.info('Connected to Redis server successfully.');
      })
      .catch(() => {
        logger.warn('Could not connect to Redis. Switching client to in-memory mock store.');
        redisClient = new RedisMock() as unknown as Redis;
      });

    redisClient = client;
    return redisClient;
  } catch (err: any) {
    logger.warn(`Failed to initialize Redis client: ${err.message}. Using mock.`);
    redisClient = new RedisMock() as unknown as Redis;
    return redisClient;
  }
}

export const redis = getRedisClient();
