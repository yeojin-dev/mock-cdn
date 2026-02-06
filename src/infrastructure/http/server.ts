import express, { Application } from 'express';
import type pino from 'pino';
import { ImageRepository } from '../../domain/image/types';
import { EtagService } from '../../domain/etag/types';
import { StatsService } from '../../domain/stats/types';
import { Config } from '../../config';
import { createHealthRoutes } from './routes/health';
import { createImageRoutes } from './routes/images';
import { createStatsRoutes } from './routes/stats';
import { createEtagRoutes } from './routes/etag';
import { createRequestLogger } from './middleware/requestLogger';
import { createErrorHandler } from './middleware/errorHandler';

export interface AppDeps {
  readonly config: Config;
  readonly logger: pino.Logger;
  readonly imageRepository: ImageRepository;
  readonly etagService: EtagService;
  readonly statsService: StatsService;
}

export function createApp(deps: AppDeps): Application {
  const app = express();

  app.use(express.json());
  app.use(createRequestLogger(deps.logger));

  app.use(createHealthRoutes({ etagService: deps.etagService }));
  app.use(createImageRoutes({
    imageRepository: deps.imageRepository,
    etagService: deps.etagService,
    statsService: deps.statsService,
    config: deps.config,
  }));
  app.use(createStatsRoutes({ statsService: deps.statsService }));
  app.use(createEtagRoutes({ etagService: deps.etagService }));

  app.use(createErrorHandler(deps.logger));

  return app;
}
