import { describe, test, expect } from 'vitest';
import { loadConfig } from './index';

describe('loadConfig', () => {
  test('returns default config when no env vars provided', () => {
    const result = loadConfig({});
    expect(result.isOk()).toBe(true);

    if (result.isOk()) {
      expect(result.value.port).toBe(3001);
      expect(result.value.cacheMaxAge).toBe(691200);
      expect(result.value.imageWidth).toBe(100);
      expect(result.value.imageHeight).toBe(100);
      expect(result.value.logLevel).toBe('info');
      expect(result.value.nodeEnv).toBe('development');
    }
  });

  test('parses valid PORT', () => {
    const result = loadConfig({ PORT: '8080' });
    expect(result.isOk()).toBe(true);

    if (result.isOk()) {
      expect(result.value.port).toBe(8080);
    }
  });

  test('returns error for invalid PORT (non-numeric)', () => {
    const result = loadConfig({ PORT: 'abc' });
    expect(result.isErr()).toBe(true);

    if (result.isErr()) {
      expect(result.error.field).toBe('PORT');
      expect(result.error.value).toBe('abc');
    }
  });

  test('returns error for PORT out of range', () => {
    const result = loadConfig({ PORT: '70000' });
    expect(result.isErr()).toBe(true);

    if (result.isErr()) {
      expect(result.error.field).toBe('PORT');
    }
  });

  test('returns error for PORT zero', () => {
    const result = loadConfig({ PORT: '0' });
    expect(result.isErr()).toBe(true);
  });

  test('parses custom CACHE_MAX_AGE', () => {
    const result = loadConfig({ CACHE_MAX_AGE: '3600' });
    expect(result.isOk()).toBe(true);

    if (result.isOk()) {
      expect(result.value.cacheMaxAge).toBe(3600);
    }
  });

  test('returns error for negative IMAGE_WIDTH', () => {
    const result = loadConfig({ IMAGE_WIDTH: '-10' });
    expect(result.isErr()).toBe(true);

    if (result.isErr()) {
      expect(result.error.field).toBe('IMAGE_WIDTH');
    }
  });

  test('parses LOG_LEVEL and NODE_ENV from env', () => {
    const result = loadConfig({ LOG_LEVEL: 'debug', NODE_ENV: 'production' });
    expect(result.isOk()).toBe(true);

    if (result.isOk()) {
      expect(result.value.logLevel).toBe('debug');
      expect(result.value.nodeEnv).toBe('production');
    }
  });
});
