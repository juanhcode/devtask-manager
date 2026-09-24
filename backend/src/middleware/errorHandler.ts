import type { Request, Response, NextFunction } from 'express';

// ── AppError ──────────────────────────────────────────────────────────────────

/**
 * Domain error with an associated HTTP status code.
 * Services throw this; the global error handler translates it to JSON.
 */
export class AppError extends Error {
  public readonly statusCode: number;

  constructor(message: string, statusCode: number) {
    super(message);
    this.name = 'AppError';
    this.statusCode = statusCode;
  }
}

// ── Global error handler ──────────────────────────────────────────────────────

// Must have 4 parameters for Express to recognize it as an error handler.
export function errorHandler(
  err: unknown,
  _req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _next: NextFunction,
): void {
  if (err instanceof AppError) {
    res.status(err.statusCode).json({ error: err.message, statusCode: err.statusCode });
    return;
  }

  // Unexpected errors — log and return a safe 500
  console.error('[Unhandled error]', err);
  res.status(500).json({ error: 'Internal server error', statusCode: 500 });
}

// ── 404 handler ───────────────────────────────────────────────────────────────

export function notFoundHandler(_req: Request, res: Response): void {
  res.status(404).json({ error: 'Route not found', statusCode: 404 });
}
