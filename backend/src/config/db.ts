import mongoose from 'mongoose';
import { MongoMemoryReplSet } from 'mongodb-memory-server';
import { env } from './env';
import { logger } from './logger';

let replSetInstance: MongoMemoryReplSet | null = null;

export async function connectDatabase(): Promise<string> {
  // If already connected, return
  if (mongoose.connection.readyState === 1) {
    return mongoose.connection.host;
  }

  // 1. Try connecting to configured MONGODB_URI if specified and not in explicit in-memory mode
  if (env.MONGODB_URI && env.NODE_ENV !== 'test') {
    try {
      logger.info(`Attempting connection to MongoDB at ${env.MONGODB_URI}...`);
      await mongoose.connect(env.MONGODB_URI, {
        serverSelectionTimeoutMS: 2500,
        maxPoolSize: 50,
      });

      // Verify that transactions are supported
      const session = await mongoose.startSession();
      try {
        session.startTransaction();
        await session.abortTransaction();
        logger.info('Connected to MongoDB replica set with transaction support.');
        return env.MONGODB_URI;
      } catch (txnErr) {
        logger.warn('Connected MongoDB does not support replica set transactions. Falling back to embedded MongoMemoryReplSet...');
        await mongoose.disconnect();
      } finally {
        session.endSession();
      }
    } catch (err: any) {
      logger.warn(`Could not connect to external MongoDB: ${err.message}. Starting embedded MongoMemoryReplSet...`);
    }
  }

  // 2. Turnkey fallback: MongoMemoryReplSet for local development & testing
  logger.info('Starting embedded MongoMemoryReplSet for turnkey ACID transaction support...');
  replSetInstance = await MongoMemoryReplSet.create({
    replSet: { count: 1, storageEngine: 'wiredTiger' },
  });
  await replSetInstance.waitUntilRunning();
  const uri = replSetInstance.getUri('feedants');
  await mongoose.connect(uri, { maxPoolSize: 50 });
  logger.info(`Embedded MongoMemoryReplSet active at: ${uri}`);
  return uri;
}

export async function disconnectDatabase(): Promise<void> {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
  }
  if (replSetInstance) {
    await replSetInstance.stop();
    replSetInstance = null;
  }
}
