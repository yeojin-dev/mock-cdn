import sharp from 'sharp';
import type { Application } from 'express';
import type pino from 'pino';
import { Config } from '../config';
import { createHashService, HashService } from '../infrastructure/crypto/hash';
import { createLogger } from '../infrastructure/logging/logger';
import { createEtagService } from '../domain/etag/service';
import { createStatsService } from '../domain/stats/service';
import { createInMemoryImageRepository } from '../domain/image/repository';
import { createImageGenerator } from '../domain/image/generator';
import { createApp } from '../infrastructure/http/server';
import { EtagService } from '../domain/etag/types';
import { StatsService } from '../domain/stats/types';
import { ImageRepository } from '../domain/image/types';

export interface Container {
  readonly config: Config;
  readonly logger: pino.Logger;
  readonly hashService: HashService;
  readonly etagService: EtagService;
  readonly statsService: StatsService;
  readonly imageRepository: ImageRepository;
  readonly app: Application;
  readonly initialize: () => Promise<void>;
}

export function createContainer(config: Config): Container {
  const logger = createLogger(config);
  const hashService = createHashService();
  const etagService = createEtagService({ hashService });
  const statsService = createStatsService();
  const imageRepository = createInMemoryImageRepository();

  const imageGenerator = createImageGenerator({
    config,
    sharp,
    repository: imageRepository,
  });

  const app = createApp({
    config,
    logger,
    imageRepository,
    etagService,
    statsService,
  });

  return {
    config,
    logger,
    hashService,
    etagService,
    statsService,
    imageRepository,
    app,

    async initialize(): Promise<void> {
      const result = await imageGenerator.generateAll();

      if (result.isErr()) {
        throw result.error;
      }

      logger.info({ count: result.value }, 'Generated test images');
    },
  };
}
