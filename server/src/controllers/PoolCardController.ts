import { Router } from 'express';
import { inject, injectable } from 'inversify';
import { z } from 'zod';
import { requireAuth, userUuid } from '../middleware/auth';
import { handle, parse, uuidParam } from '../middleware/http';
import { AuthService } from '../services/AuthService';
import { PoolCardService } from '../services/PoolCardService';
import { TYPES } from '../types';
import type { Controller } from '../interfaces/controller';

@injectable()
export class PoolCardController implements Controller {
  basePath = '/api/poolcards';

  constructor(
    @inject(TYPES.AuthService) private auth: AuthService,
    @inject(TYPES.PoolCardService) private service: PoolCardService,
  ) {}

  router() {
    const router = Router();

    router.get('/', handle(async () => {
      return this.service.getAll();
    }));

    router.get('/:uuid', handle(async (req) => {
      return this.service.getSubCards(uuidParam(req));
    }));

    router.post('/', requireAuth(this.auth), handle(async (req) => {
      const { mastercard } = parse(z.object({
        mastercard: z.object({
          uuid: z.string(),
        }),
      }), req.body);
      return this.service.create(mastercard.uuid, userUuid(req));
    }));

    router.post('/add/:uuid', requireAuth(this.auth), handle(async (req) => {
      return this.service.storeToMaster(uuidParam(req), userUuid(req));
    }));

    router.delete('/:uuid', requireAuth(this.auth), handle(async (req) => {
      return this.service.remove(uuidParam(req));
    }));

    return router;
  }
}
