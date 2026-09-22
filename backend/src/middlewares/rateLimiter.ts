import rateLimit from 'express-rate-limit';
import { sendError } from '../utils/response';

export const globalRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    return sendError(res, 429, 'RATE_LIMITED', 'Too many requests, please try again later.');
  },
});

export const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    return sendError(res, 429, 'RATE_LIMITED', 'Too many authentication attempts, please try again later.');
  },
});

export const registrationRateLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 60,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    return sendError(res, 429, 'RATE_LIMITED', 'Too many registration attempts. Please slow down.');
  },
});
