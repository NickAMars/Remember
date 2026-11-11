import { Router } from 'express';
import { inject, injectable } from 'inversify';
import { z } from 'zod';
import { requireAuth, userUuid } from '../middleware/auth';
import { handle, parse, uuidParam } from '../middleware/http';
import { AuthService } from '../services/AuthService';
import { ReviewService } from '../services/ReviewService';
import { TYPES } from '../types';
import type { Controller } from '../interfaces/controller';

@injectable()
export class ReviewController implements Controller {
  basePath = '/api/review';

  constructor(
    @inject(TYPES.AuthService) private auth: AuthService,
    @inject(TYPES.ReviewService) private service: ReviewService,
  ) {}

  router() {
    const router = Router();
    router.use(requireAuth(this.auth));

    router.post('/results', handle(async (req) => {
      const { results } = parse(z.object({
        results: z.array(z.object({
          subCardUuid: z.string(),
          correct: z.boolean(),
          mode: z.enum(['choice', 'flash']),
        })),
      }), req.body);
      await this.service.submitResults(userUuid(req), results);
      return { ok: true };
    }));

    router.get('/due', handle(async (req) => {
      return this.service.getDueCounts(userUuid(req));
    }));

    const uuidPattern = '[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}';

    router.get(`/due/:uuid(${uuidPattern})`, handle(async (req) => {
      const count = req.query.count !== undefined ? parseInt(req.query.count as string, 10) : undefined;
      return this.service.getDueCards(userUuid(req), uuidParam(req), count);
    }));

    return router;
  }
}
