import app from './app';
import { env } from './config/env';
import { connectDatabase, disconnectDatabase } from './config/db';
import { logger } from './config/logger';
import { startExpirySweepJob, stopExpirySweepJob } from './jobs/expirySweep';

async function bootstrap() {
  try {
    // 1. Connect to MongoDB (with replica set support)
    const dbUri = await connectDatabase();
    logger.info(`Database connected: ${dbUri}`);

    // 2. Start background scheduled jobs
    startExpirySweepJob();

    // 3. Start HTTP server
    const server = app.listen(env.PORT, () => {
      logger.info(`Feedants Competition API running on port ${env.PORT} (${env.NODE_ENV})`);
      logger.info(`Health check available at http://localhost:${env.PORT}/health`);
      logger.info(`API Base Path: http://localhost:${env.PORT}${env.API_BASE_PATH}`);
    });

    // 4. Graceful shutdown
    const gracefulShutdown = async (signal: string) => {
      logger.info(`Received ${signal}. Gracefully shutting down...`);
      stopExpirySweepJob();
      server.close(async () => {
        logger.info('HTTP server closed.');
        await disconnectDatabase();
        logger.info('Database disconnected. Process exiting.');
        process.exit(0);
      });
    };

    process.on('SIGINT', () => gracefulShutdown('SIGINT'));
    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
  } catch (err: any) {
    logger.fatal(`Failed to start server: ${err.message}`);
    process.exit(1);
  }
}

bootstrap();
