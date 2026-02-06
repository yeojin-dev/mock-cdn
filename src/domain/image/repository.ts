import { ImageName } from '../types';
import { ImageRepository } from './types';

export function createInMemoryImageRepository(): ImageRepository {
  const images = new Map<string, Buffer>();

  return {
    get(name: string): Buffer | undefined {
      return images.get(name);
    },

    set(name: ImageName, buffer: Buffer): void {
      images.set(name, buffer);
    },

    has(name: string): boolean {
      return images.has(name);
    },

    names(): readonly string[] {
      return Array.from(images.keys());
    },

    size(): number {
      return images.size;
    },
  };
}
