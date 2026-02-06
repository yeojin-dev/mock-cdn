import { Router } from 'express';
import { EtagService } from '../../../domain/etag/types';
import { parseEtagMode } from '../../../domain/etag/service';

export function createEtagRoutes(deps: { etagService: EtagService }): Router {
  const router = Router();

  router.post('/set-etag-mode', (req, res) => {
    const { mode } = req.body;

    if (typeof mode !== 'string') {
      return res.status(400).json({
        error: 'Invalid mode',
        validModes: ['consistent', 'random'],
      });
    }

    const result = parseEtagMode(mode);

    if (result.isErr()) {
      return res.status(400).json({
        error: 'Invalid mode',
        validModes: ['consistent', 'random'],
      });
    }

    deps.etagService.setMode(result.value);
    res.json({
      etagMode: result.value,
      message: 'ETag mode updated',
    });
  });

  return router;
}
