import express from 'express';
import path from 'path';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import mongoSanitize from 'express-mongo-sanitize';
import { env } from './config/env';
import { globalRateLimiter } from './middlewares/rateLimiter';
import { errorHandler } from './middlewares/errorHandler';
import { sendError, sendSuccess } from './utils/response';
import authRoutes from './routes/auth.routes';
import competitionRoutes from './routes/competition.routes';
import paymentRoutes from './routes/payment.routes';
import referralRoutes from './routes/referral.routes';
import webhookRoutes from './routes/webhook.routes';

const app = express();

// 1. Security headers
app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));

// 2. CORS
app.use(
  cors({
    origin: '*',
    credentials: true,
  })
);

// 3. Body parser with rawBody capture for webhook signature verification
app.use(
  express.json({
    limit: '1mb',
    verify: (req: any, res, buf) => {
      req.rawBody = buf.toString();
    },
  })
);
app.use(express.urlencoded({ extended: true }));

// 4. Sanitize against NoSQL injection
app.use(mongoSanitize());

// 5. Logging
if (env.NODE_ENV !== 'test') {
  app.use(morgan('dev'));
}

// 6. Global rate limiter
app.use(globalRateLimiter);

// 7. Static file serving for uploads
app.use('/uploads', express.static(path.resolve(__dirname, '../uploads')));

// 8. Health check
app.get('/health', (req, res) => {
  return sendSuccess(res, {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    env: env.NODE_ENV,
  });
});

// 9. API routes
const apiRouter = express.Router();
apiRouter.use('/auth', authRoutes);
apiRouter.use('/competitions', competitionRoutes);
apiRouter.use('/payments', paymentRoutes);
apiRouter.use('/referrals', referralRoutes);
apiRouter.use('/webhooks', webhookRoutes);

app.use(env.API_BASE_PATH, apiRouter);

// 10. 404 handler
app.use((req, res) => {
  return sendError(res, 404, 'NOT_FOUND', `Route ${req.method} ${req.originalUrl} not found`);
});

// 11. Centralized error handler
app.use(errorHandler);

export default app;
