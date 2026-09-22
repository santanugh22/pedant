export type ErrorCode =
  | 'VALIDATION_ERROR'
  | 'UNAUTHORIZED'
  | 'FORBIDDEN'
  | 'NOT_FOUND'
  | 'ALREADY_REGISTERED'
  | 'REGISTRATION_CLOSED'
  | 'SPOTS_FULL'
  | 'SPOTS_FULL_OR_CLOSED'
  | 'SUBMISSION_WINDOW_CLOSED'
  | 'NOT_REGISTERED'
  | 'PAYMENT_PENDING'
  | 'PAYMENT_VERIFICATION_FAILED'
  | 'RATE_LIMITED'
  | 'INTERNAL_ERROR';

export class AppError extends Error {
  public readonly statusCode: number;
  public readonly code: ErrorCode;
  public readonly details?: any;

  constructor(statusCode: number, code: ErrorCode, message: string, details?: any) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
    Object.setPrototypeOf(this, new.target.prototype);
    Error.captureStackTrace(this, this.constructor);
  }
}

export class ValidationError extends AppError {
  constructor(message: string, details?: any) {
    super(400, 'VALIDATION_ERROR', message, details);
  }
}

export class UnauthorizedError extends AppError {
  constructor(message = 'Authentication required') {
    super(401, 'UNAUTHORIZED', message);
  }
}

export class ForbiddenError extends AppError {
  constructor(message = 'Access forbidden') {
    super(403, 'FORBIDDEN', message);
  }
}

export class NotFoundError extends AppError {
  constructor(message = 'Resource not found') {
    super(404, 'NOT_FOUND', message);
  }
}

export class ConflictError extends AppError {
  constructor(code: ErrorCode, message: string) {
    super(409, code, message);
  }
}
