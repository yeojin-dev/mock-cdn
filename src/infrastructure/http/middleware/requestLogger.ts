import pinoHttp from 'pino-http';
import type pino from 'pino';

export function createRequestLogger(logger: pino.Logger) {
  return pinoHttp({ logger });
}
