import type { ErrorRequestHandler, NextFunction, Request, Response } from 'express';

export function errorMiddleware(err: unknown, _req: Request, res: Response, _next: NextFunction) {
  console.error(err);

  if (err instanceof Error) {
    return res.status(500).json({ success: false, message: err.message });
  }

  return res.status(500).json({ success: false, message: 'Internal server error.' });
}

export const notFoundHandler: ErrorRequestHandler = (_err, _req, res, _next) => {
  res.status(404).json({ success: false, message: 'Route not found.' });
};
