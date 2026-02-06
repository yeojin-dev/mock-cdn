import { ImageName } from '../types';

export interface ImageRepository {
  readonly get: (name: string) => Buffer | undefined;
  readonly set: (name: ImageName, buffer: Buffer) => void;
  readonly has: (name: string) => boolean;
  readonly names: () => readonly string[];
  readonly size: () => number;
}
