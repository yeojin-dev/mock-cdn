import { ResultAsync } from 'neverthrow';
import sharp from 'sharp';
import { ImageSpec, DEFAULT_IMAGE_SPECS } from '../types';
import { ImageRepository } from './types';
import { Config } from '../../config';

type SharpFn = typeof sharp;

interface ImageGeneratorDeps {
  readonly config: Pick<Config, 'imageWidth' | 'imageHeight'>;
  readonly sharp: SharpFn;
  readonly repository: ImageRepository;
}

export function createImageGenerator(deps: ImageGeneratorDeps) {
  return {
    generateAll(
      specs: readonly ImageSpec[] = DEFAULT_IMAGE_SPECS,
    ): ResultAsync<number, Error> {
      return ResultAsync.fromPromise(
        (async () => {
          for (const spec of specs) {
            const buffer = await deps.sharp({
              create: {
                width: deps.config.imageWidth,
                height: deps.config.imageHeight,
                channels: 3,
                background: spec.color,
              },
            })
              .jpeg()
              .toBuffer();

            deps.repository.set(spec.name, buffer);
          }
          return specs.length;
        })(),
        (error) => error instanceof Error ? error : new Error(String(error)),
      );
    },
  };
}
