import { Request, Response, NextFunction } from 'express';
import type pino from 'pino';

export function createErrorHandler(logger: pino.Logger) {
  return (err: Error, _req: Request, res: Response, _next: NextFunction): void => {
    logger.error({ err }, 'Unhandled error');
    res.status(500).json({ error: 'Internal server error' });
  };
}
