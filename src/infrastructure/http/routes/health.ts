import { Router } from 'express';
import { EtagService } from '../../../domain/etag/types';

export function createHealthRoutes(deps: { etagService: EtagService }): Router {
  const router = Router();

  router.get('/', (_req, res) => {
    res.json({
      service: 'Mock CDN',
      status: 'running',
      etagMode: deps.etagService.getMode(),
    });
  });

  router.get('/health', (_req, res) => {
    res.json({ status: 'ok' });
  });

  return router;
}
