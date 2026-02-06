import pino from 'pino';
import type { Config } from '../../config';

export function createLogger(config: Pick<Config, 'logLevel' | 'nodeEnv'>): pino.Logger {
  const isDev = config.nodeEnv === 'development';

  return pino({
    level: config.logLevel,
    ...(isDev && {
      transport: {
        target: 'pino-pretty',
        options: { colorize: true },
      },
    }),
  });
}
