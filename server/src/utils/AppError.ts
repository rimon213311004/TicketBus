export class AppError extends Error {
  public readonly statusCode: number;
  public readonly errors?: unknown;

  constructor(statusCode: number, message: string, errors?: unknown) {
    super(message);
    this.statusCode = statusCode;
    this.errors = errors;
    Error.captureStackTrace(this, this.constructor);
  }

  static badRequest(message: string, errors?: unknown) {
    return new AppError(400, message, errors);
  }
  static unauthorized(message = 'Authentication required') {
    return new AppError(401, message);
  }
  static forbidden(message = 'You do not have permission to perform this action') {
    return new AppError(403, message);
  }
  static notFound(message = 'Resource not found') {
    return new AppError(404, message);
  }
  static conflict(message: string, errors?: unknown) {
    return new AppError(409, message, errors);
  }
}
