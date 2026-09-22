import { Request, Response, NextFunction } from 'express';

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  meta?: Record<string, any>;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
}

export function sendSuccess<T>(res: Response, data: T, statusCode = 200, meta?: Record<string, any>): Response {
  const payload: ApiResponse<T> = {
    success: true,
    data,
    meta,
  };
  return res.status(statusCode).json(payload);
}

export function sendError(res: Response, statusCode: number, code: string, message: string, details?: any): Response {
  const payload: ApiResponse = {
    success: false,
    error: {
      code,
      message,
      details,
    },
  };
  return res.status(statusCode).json(payload);
}

export const catchAsync =
  (fn: (req: Request, res: Response, next: NextFunction) => Promise<any>) =>
  (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
