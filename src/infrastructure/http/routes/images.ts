import { Router } from 'express';
import { ImageRepository } from '../../../domain/image/types';
import { EtagService } from '../../../domain/etag/types';
import { StatsService } from '../../../domain/stats/types';
import { Config } from '../../../config';

interface ImageRoutesDeps {
  readonly imageRepository: ImageRepository;
  readonly etagService: EtagService;
  readonly statsService: StatsService;
  readonly config: Pick<Config, 'cacheMaxAge'>;
}

export function createImageRoutes(deps: ImageRoutesDeps): Router {
  const router = Router();

  router.route('/images/:filename')
    .head((req, res) => {
      const { filename } = req.params;
      const image = deps.imageRepository.get(filename);

      if (!image) {
        return res.status(404).json({ error: 'Image not found', filename });
      }

      deps.statsService.incrementHead(filename);

      res.set({
        'ETag': deps.etagService.generate(filename),
        'Content-Type': 'image/jpeg',
        'Cache-Control': `max-age=${deps.config.cacheMaxAge}`,
        'Content-Length': image.length.toString(),
      });

      res.end();
    })
    .get((req, res) => {
      const { filename } = req.params;
      const image = deps.imageRepository.get(filename);

      if (!image) {
        return res.status(404).json({ error: 'Image not found', filename });
      }

      deps.statsService.incrementGet(filename);

      res.set({
        'ETag': deps.etagService.generate(filename),
        'Content-Type': 'image/jpeg',
        'Cache-Control': `max-age=${deps.config.cacheMaxAge}`,
        'Content-Length': image.length.toString(),
      });

      res.send(image);
    });

  return router;
}
