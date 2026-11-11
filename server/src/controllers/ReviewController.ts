import { Router } from 'express';
import { inject, injectable } from 'inversify';
import { z } from 'zod';
import { requireAuth, userUuid } from '../middleware/auth';
import { handle, parse, uuidParam } from '../middleware/http';
import { AuthService } from '../services/AuthService';
import { ReviewService } from '../services/ReviewService';
import { TYPES } from '../types';
import type { Controller } from '../interfaces/controller';
import { MAX_QUIZ_QUESTIONS, MAX_REVIEW_RESULTS_PER_REQUEST } from '../constants';
import { UUID_REGEX, UUID_ROUTE_PATTERN } from '../utils/validation';

const resultsBody = z.object({
  results: z.array(z.object({
    subCardUuid: z.string().regex(UUID_REGEX, 'Invalid card id').transform((cardUuid) => cardUuid.toLowerCase()),
    correct: z.boolean(),
    mode: z.enum(['choice', 'flash']),
  })).max(MAX_REVIEW_RESULTS_PER_REQUEST),
});

const dueCardsQuery = z.object({
  count: z.coerce.number().int().min(0).max(MAX_QUIZ_QUESTIONS).optional(),
});

/** Spaced repetition: save quiz answers and list the cards that are due. */
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

    router.post('/results', handle(async (request) => {
      const { results } = parse(resultsBody, request.body);
      await this.service.submitResults(userUuid(request), results);
      return { ok: true };
    }));

    router.get('/due', handle(async (request) => this.service.getDueCounts(userUuid(request))));

    router.get(`/due/:uuid(${UUID_ROUTE_PATTERN})`, handle(async (request) => {
      const { count } = parse(dueCardsQuery, request.query);
      return this.service.getDueCards(userUuid(request), uuidParam(request), count);
    }));

    return router;
  }
}
