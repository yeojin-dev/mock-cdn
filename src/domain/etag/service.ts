import { ok, err, Result } from 'neverthrow';
import { EtagMode } from '../types';
import { DomainError, invalidEtagMode } from '../errors';
import { HashService } from '../../infrastructure/crypto/hash';
import { EtagService } from './types';

const VALID_MODES: readonly EtagMode[] = ['consistent', 'random'];

export function parseEtagMode(value: string): Result<EtagMode, DomainError> {
  if (VALID_MODES.includes(value as EtagMode)) {
    return ok(value as EtagMode);
  }
  return err(invalidEtagMode(value));
}

interface EtagServiceDeps {
  readonly hashService: HashService;
}

export function createEtagService(deps: EtagServiceDeps): EtagService {
  let currentMode: EtagMode = 'consistent';

  return {
    getMode(): EtagMode {
      return currentMode;
    },

    setMode(mode: EtagMode): void {
      currentMode = mode;
    },

    generate(filename: string): string {
      if (currentMode === 'consistent') {
        return `"${deps.hashService.md5(filename)}"`;
      }
      return `"${deps.hashService.randomHex32()}"`;
    },
  };
}
