import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import mongoose from 'mongoose';
import { AppError } from '../utils/AppError';
import { env } from '../config/env';
import { logger } from '../utils/logger';

export function notFoundHandler(req: Request, res: Response) {
  res.status(404).json({ success: false, message: `Route not found: ${req.method} ${req.originalUrl}` });
}

export function errorHandler(err: unknown, _req: Request, res: Response, _next: NextFunction) {
  let statusCode = 500;
  let message = 'Something went wrong';
  let errors: unknown;

  if (err instanceof AppError) {
    statusCode = err.statusCode;
    message = err.message;
    errors = err.errors;
  } else if (err instanceof ZodError) {
    statusCode = 400;
    message = 'Validation failed';
    errors = err.issues.map((i) => ({ path: i.path.join('.'), message: i.message }));
  } else if (err instanceof mongoose.Error.ValidationError) {
    statusCode = 400;
    message = 'Validation failed';
    errors = Object.values(err.errors).map((e) => ({ path: e.path, message: e.message }));
  } else if (err instanceof mongoose.Error.CastError) {
    statusCode = 400;
    message = `Invalid value for ${err.path}`;
  } else if (typeof err === 'object' && err !== null && (err as { code?: number }).code === 11000) {
    statusCode = 409;
    const keys = Object.keys((err as { keyValue?: Record<string, unknown> }).keyValue ?? {});
    message = `Duplicate value for ${keys.join(', ') || 'field'}`;
  } else if (err instanceof Error) {
    message = err.message;
  }

  if (statusCode >= 500) logger.error(message, err);

  res.status(statusCode).json({
    success: false,
    message,
    ...(errors ? { errors } : {}),
    ...(env.isProduction ? {} : { stack: err instanceof Error ? err.stack : undefined }),
  });
}
