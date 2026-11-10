import { Router } from 'express';
import { inject, injectable } from 'inversify';
import { z } from 'zod';
import { requireAuth, userUuid } from '../middleware/auth';
import { handle, parse, uuidParam } from '../middleware/http';
import { AuthService } from '../services/AuthService';
import { SubCardService } from '../services/SubCardService';
import { TYPES } from '../types';
import type { Controller } from '../interfaces/controller';

@injectable()
export class SubCardController implements Controller {
  basePath = '/api/profile/MasterCard';

  constructor(
    @inject(TYPES.AuthService) private auth: AuthService,
    @inject(TYPES.SubCardService) private service: SubCardService,
  ) {}

  router() {
    const router = Router();
    router.use(requireAuth(this.auth));

    router.get('/:uuid/subcards', handle(async (req) => {
      return this.service.getForMasterCard(uuidParam(req));
    }));

    router.post('/:uuid/subcards', handle(async (req) => {
      const { title, descriptions } = parse(z.object({
        title: z.string().min(1).max(255),
        descriptions: z.string().max(2000).default(''),
      }), req.body);
      return this.service.add(uuidParam(req), userUuid(req), title, descriptions);
    }));

    router.put('/subcards/:uuid', handle(async (req) => {
      const { title, descriptions } = parse(z.object({
        title: z.string().min(1).max(255),
        descriptions: z.string().max(2000).default(''),
      }), req.body);
      return this.service.update(uuidParam(req), userUuid(req), title, descriptions);
    }));

    router.delete('/subcards/:uuid', handle(async (req) => {
      await this.service.delete(uuidParam(req), userUuid(req));
      return { ok: true };
    }));

    return router;
  }
}
