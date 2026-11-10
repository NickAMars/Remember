import { Router } from 'express';
import { inject, injectable } from 'inversify';
import { z } from 'zod';
import { requireAuth, userUuid } from '../middleware/auth';
import { handle, parse, uuidParam } from '../middleware/http';
import { AuthService } from '../services/AuthService';
import { MasterCardService } from '../services/MasterCardService';
import { TYPES } from '../types';
import type { Controller } from '../interfaces/controller';

@injectable()
export class MasterCardController implements Controller {
  basePath = '/api/profile/MasterCard';

  constructor(
    @inject(TYPES.AuthService) private auth: AuthService,
    @inject(TYPES.MasterCardService) private service: MasterCardService,
  ) {}

  router() {
    const router = Router();
    router.use(requireAuth(this.auth));

    router.get('/', handle(async (req) => {
      return this.service.getAllForUser(userUuid(req));
    }));

    router.get('/:uuid', handle(async (req) => {
      const card = await this.service.getOne(uuidParam(req));
      return card.progress;
    }));

    router.post('/', handle(async (req) => {
      const { title, cards } = parse(z.object({
        title: z.string().min(1).max(255),
        cards: z.array(z.object({
          title: z.string().min(1).max(255),
          description: z.string().max(2000).default(''),
        })),
      }), req.body);
      return this.service.create(userUuid(req), title, cards);
    }));

    router.put('/:uuid', handle(async (req) => {
      const { title, date } = parse(z.object({
        title: z.string().min(1).max(255),
        date: z.string().optional(),
      }), req.body);
      return this.service.update(uuidParam(req), userUuid(req), title, date);
    }));

    router.delete('/:uuid', handle(async (req) => {
      await this.service.delete(uuidParam(req), userUuid(req));
      return { ok: true };
    }));

    router.put('/time/:uuid', handle(async (req) => {
      const { time } = parse(z.object({
        time: z.number().nonnegative(),
      }), req.body);
      return this.service.recordTime(uuidParam(req), userUuid(req), time);
    }));

    return router;
  }
}
