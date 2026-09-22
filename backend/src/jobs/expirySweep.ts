import cron from 'node-cron';
import { RegistrationService } from '../services/registrationService';
import { logger } from '../config/logger';

let task: cron.ScheduledTask | null = null;

export function startExpirySweepJob(): void {
  // Run every 2 minutes
  task = cron.schedule('*/2 * * * *', async () => {
    try {
      await RegistrationService.releaseExpiredHolds();
    } catch (err: any) {
      logger.error(`Error in registration hold expiry sweep job: ${err.message}`);
    }
  });

  logger.info('Scheduled hold-release sweep job started (runs every 2 minutes).');
}

export function stopExpirySweepJob(): void {
  if (task) {
    task.stop();
    task = null;
  }
}
