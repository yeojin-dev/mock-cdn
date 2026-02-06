import { ok, err, Result } from 'neverthrow';

export interface Config {
  readonly port: number;
  readonly cacheMaxAge: number;
  readonly imageWidth: number;
  readonly imageHeight: number;
  readonly logLevel: string;
  readonly nodeEnv: string;
}

export interface ConfigError {
  readonly field: string;
  readonly message: string;
  readonly value?: string;
}

const DEFAULT_CONFIG = {
  port: 3001,
  cacheMaxAge: 691200,
  imageWidth: 100,
  imageHeight: 100,
  logLevel: 'info',
  nodeEnv: 'development',
} as const satisfies Config;

function parsePort(value: string | undefined): Result<number, ConfigError> {
  if (value === undefined || value === '') {
    return ok(DEFAULT_CONFIG.port);
  }

  const port = Number(value);

  if (!Number.isInteger(port) || port < 1 || port > 65535) {
    return err({
      field: 'PORT',
      message: 'PORT must be an integer between 1 and 65535',
      value,
    });
  }

  return ok(port);
}

function parsePositiveInt(
  value: string | undefined,
  field: string,
  defaultValue: number,
): Result<number, ConfigError> {
  if (value === undefined || value === '') {
    return ok(defaultValue);
  }

  const num = Number(value);

  if (!Number.isInteger(num) || num < 1) {
    return err({
      field,
      message: `${field} must be a positive integer`,
      value,
    });
  }

  return ok(num);
}

export function loadConfig(
  env: Record<string, string | undefined> = process.env,
): Result<Config, ConfigError> {
  const portResult = parsePort(env.PORT);
  if (portResult.isErr()) return err(portResult.error);

  const cacheMaxAgeResult = parsePositiveInt(
    env.CACHE_MAX_AGE,
    'CACHE_MAX_AGE',
    DEFAULT_CONFIG.cacheMaxAge,
  );
  if (cacheMaxAgeResult.isErr()) return err(cacheMaxAgeResult.error);

  const imageWidthResult = parsePositiveInt(
    env.IMAGE_WIDTH,
    'IMAGE_WIDTH',
    DEFAULT_CONFIG.imageWidth,
  );
  if (imageWidthResult.isErr()) return err(imageWidthResult.error);

  const imageHeightResult = parsePositiveInt(
    env.IMAGE_HEIGHT,
    'IMAGE_HEIGHT',
    DEFAULT_CONFIG.imageHeight,
  );
  if (imageHeightResult.isErr()) return err(imageHeightResult.error);

  return ok({
    port: portResult.value,
    cacheMaxAge: cacheMaxAgeResult.value,
    imageWidth: imageWidthResult.value,
    imageHeight: imageHeightResult.value,
    logLevel: env.LOG_LEVEL ?? DEFAULT_CONFIG.logLevel,
    nodeEnv: env.NODE_ENV ?? DEFAULT_CONFIG.nodeEnv,
  });
}
