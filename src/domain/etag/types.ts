import { EtagMode } from '../types';

export interface EtagService {
  readonly getMode: () => EtagMode;
  readonly setMode: (mode: EtagMode) => void;
  readonly generate: (filename: string) => string;
}
