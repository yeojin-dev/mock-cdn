import { Router } from 'express';
import { StatsService } from '../../../domain/stats/types';

export function createStatsRoutes(deps: { statsService: StatsService }): Router {
  const router = Router();

  router.get('/stats', (_req, res) => {
    const snapshot = deps.statsService.getSnapshot();
    res.json(snapshot);
  });

  router.post('/reset-stats', (_req, res) => {
    deps.statsService.reset();
    const snapshot = deps.statsService.getSnapshot();
    res.json({ message: 'Stats reset', ...snapshot });
  });

  return router;
}
