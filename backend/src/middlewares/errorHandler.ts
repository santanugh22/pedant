import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/errors';
import { sendError } from '../utils/response';
import { logger } from '../config/logger';

export function errorHandler(
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
): Response | void {
  if (err instanceof AppError) {
    return sendError(res, err.statusCode, err.code, err.message, err.details);
  }

  // Handle Mongoose duplicate key error (E11000)
  if (err.name === 'MongoServerError' && err.code === 11000) {
    const field = Object.keys(err.keyPattern || {})[0] || 'field';
    if (field === 'competitionId' || field === 'userId') {
      return sendError(res, 409, 'ALREADY_REGISTERED', 'You already have an active registration for this competition');
    }
    return sendError(res, 409, 'VALIDATION_ERROR', `Duplicate entry for ${field}`);
  }

  // Log unexpected errors
  logger.error({ err, path: req.path, method: req.method }, 'Unhandled internal server error');

  return sendError(
    res,
    500,
    'INTERNAL_ERROR',
    process.env.NODE_ENV === 'production' ? 'An internal server error occurred' : err.message
  );
}
