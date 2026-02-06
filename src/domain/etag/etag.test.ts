import { describe, test, expect, beforeEach } from 'vitest';
import { createEtagService, parseEtagMode } from './service';
import { HashService } from '../../infrastructure/crypto/hash';

function createMockHashService(): HashService {
  let counter = 0;
  return {
    md5(input: string): string {
      let hash = 0;
      for (let i = 0; i < input.length; i++) {
        hash = ((hash << 5) - hash + input.charCodeAt(i)) | 0;
      }
      return Math.abs(hash).toString(16).padStart(32, '0').slice(0, 32);
    },
    randomHex32(): string {
      counter++;
      return counter.toString(16).padStart(32, '0');
    },
  };
}

describe('ETag Service', () => {
  let service: ReturnType<typeof createEtagService>;

  beforeEach(() => {
    service = createEtagService({ hashService: createMockHashService() });
  });

  describe('consistent mode', () => {
    test('returns same ETag for same filename', () => {
      service.setMode('consistent');
      const etag1 = service.generate('test.jpg');
      const etag2 = service.generate('test.jpg');
      expect(etag1).toBe(etag2);
    });

    test('returns different ETag for different filenames', () => {
      service.setMode('consistent');
      const etag1 = service.generate('file1.jpg');
      const etag2 = service.generate('file2.jpg');
      expect(etag1).not.toBe(etag2);
    });
  });

  describe('random mode', () => {
    test('returns different ETag each call', () => {
      service.setMode('random');
      const etag1 = service.generate('test.jpg');
      const etag2 = service.generate('test.jpg');
      expect(etag1).not.toBe(etag2);
    });
  });

  describe('ETag format', () => {
    test('is wrapped in double quotes', () => {
      const etag = service.generate('test.jpg');
      expect(etag.startsWith('"')).toBe(true);
      expect(etag.endsWith('"')).toBe(true);
    });

    test('contains 32-char lowercase hex between quotes', () => {
      const etag = service.generate('test.jpg');
      const inner = etag.slice(1, -1);
      expect(inner.length).toBe(32);
      expect(inner).toMatch(/^[a-f0-9]{32}$/);
    });

    test('full format matches S3 ETag pattern', () => {
      const etag = service.generate('test.jpg');
      expect(etag).toMatch(/^"[a-f0-9]{32}"$/);
    });
  });

  describe('mode switching', () => {
    test('setMode changes the mode', () => {
      service.setMode('consistent');
      expect(service.getMode()).toBe('consistent');

      service.setMode('random');
      expect(service.getMode()).toBe('random');
    });

    test('getMode returns current mode', () => {
      service.setMode('consistent');
      expect(service.getMode()).toBe('consistent');
    });

    test('defaults to consistent mode', () => {
      expect(service.getMode()).toBe('consistent');
    });
  });
});

describe('parseEtagMode', () => {
  test('accepts "consistent"', () => {
    const result = parseEtagMode('consistent');
    expect(result.isOk()).toBe(true);
    if (result.isOk()) expect(result.value).toBe('consistent');
  });

  test('accepts "random"', () => {
    const result = parseEtagMode('random');
    expect(result.isOk()).toBe(true);
    if (result.isOk()) expect(result.value).toBe('random');
  });

  test('rejects invalid mode', () => {
    const result = parseEtagMode('invalid');
    expect(result.isErr()).toBe(true);
    if (result.isErr()) expect(result.error.kind).toBe('INVALID_ETAG_MODE');
  });
});
