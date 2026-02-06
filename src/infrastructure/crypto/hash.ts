import crypto from 'crypto';

export interface HashService {
  readonly md5: (input: string) => string;
  readonly randomHex32: () => string;
}

export function createHashService(): HashService {
  return {
    md5(input: string): string {
      return crypto.createHash('md5').update(input).digest('hex');
    },
    randomHex32(): string {
      return crypto.randomBytes(16).toString('hex');
    },
  };
}
