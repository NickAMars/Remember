import { Router } from 'express';
import { inject, injectable } from 'inversify';
import { z } from 'zod';
import { requireAuth, userUuid } from '../middleware/auth';
import { handle, parse, uuidParam } from '../middleware/http';
import { AuthService } from '../services/AuthService';
import { PoolCardService } from '../services/PoolCardService';
import { TYPES } from '../types';
import type { Controller } from '../interfaces/controller';
import { UUID_REGEX, UUID_ROUTE_PATTERN } from '../utils/validation';

const shareDeckBody = z.object({
  mastercard: z.object({
    uuid: z.string().regex(UUID_REGEX, 'Invalid deck id').transform((deckUuid) => deckUuid.toLowerCase()),
  }),
});

/** Public decks that anyone can browse and copy into their own account. */
@injectable()
export class PoolCardController implements Controller {
  basePath = '/api/poolcards';

  constructor(
    @inject(TYPES.AuthService) private auth: AuthService,
    @inject(TYPES.PoolCardService) private service: PoolCardService,
  ) {}

  router() {
    const router = Router();
    const publicDeckPath = `/:uuid(${UUID_ROUTE_PATTERN})`;

    router.get('/', handle(async () => this.service.getAll()));

    router.get(`${publicDeckPath}/summary`, handle(async (request) => this.service.getSummary(uuidParam(request))));

    router.get(publicDeckPath, handle(async (request) => this.service.getSubCards(uuidParam(request))));

    router.post('/', requireAuth(this.auth), handle(async (request) => {
      const { mastercard } = parse(shareDeckBody, request.body);
      return this.service.create(mastercard.uuid, userUuid(request));
    }));

    router.post(`/add${publicDeckPath}`, requireAuth(this.auth), handle(async (request) =>
      this.service.storeToMaster(uuidParam(request), userUuid(request))));

    // Security: only the author can un-share a deck. Anyone signed in could delete any public deck before.
    router.delete(publicDeckPath, requireAuth(this.auth), handle(async (request) =>
      this.service.remove(uuidParam(request), userUuid(request))));

    return router;
  }
}
