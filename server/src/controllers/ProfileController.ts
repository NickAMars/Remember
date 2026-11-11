import { Router } from 'express';
import { inject, injectable } from 'inversify';
import { requireAuth, userUuid } from '../middleware/auth';
import { handle } from '../middleware/http';
import { AuthService } from '../services/AuthService';
import { MasterCardService } from '../services/MasterCardService';
import { SubCardService } from '../services/SubCardService';
import { TYPES } from '../types';
import type { Controller } from '../interfaces/controller';

const TOP_CARDS_ON_PROFILE = 10;

@injectable()
export class ProfileController implements Controller {
  basePath = '/api/profile';

  constructor(
    @inject(TYPES.AuthService) private auth: AuthService,
    @inject(TYPES.MasterCardService) private masterCardService: MasterCardService,
    @inject(TYPES.SubCardService) private subCardService: SubCardService,
  ) {}

  router() {
    const router = Router();
    router.use(requireAuth(this.auth));

    router.get('/', handle(async (request) => {
      const uuid = userUuid(request);
      const user = await this.auth.getUserByUuid(uuid);
      if (!user) return null;
      // perf Increase: the two lists don't depend on each other, so load them at the same time.
      const [allCardsByViews, topSubCards] = await Promise.all([
        this.masterCardService.getAllByViews(uuid),
        this.subCardService.getTopSubCards(uuid, TOP_CARDS_ON_PROFILE),
      ]);
      return {
        uuid: user.uuid,
        name: user.name,
        authType: user.authType,
        allCardsByViews,
        topSubCards,
        countCards: allCardsByViews.length,
      };
    }));

    router.delete('/deactivate', handle(async (request) => {
      const uuid = userUuid(request);
      await this.auth.deactivateAccount(uuid);
      return { ok: true };
    }));

    return router;
  }
}
