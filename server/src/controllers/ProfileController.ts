import { Router } from 'express';
import { inject, injectable } from 'inversify';
import { requireAuth, userUuid } from '../middleware/auth';
import { handle } from '../middleware/http';
import { AuthService } from '../services/AuthService';
import { MasterCardService } from '../services/MasterCardService';
import { SubCardService } from '../services/SubCardService';
import { TYPES } from '../types';
import type { Controller } from '../interfaces/controller';

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

    router.get('/', handle(async (req) => {
      const uuid = userUuid(req);
      const user = await this.auth.getUserByUuid(uuid);
      if (!user) return null;
      const allCardsByViews = await this.masterCardService.getAllByViews(uuid);
      const topSubCards = await this.subCardService.getTopSubCards(uuid, 10);
      return {
        uuid: user.uuid,
        name: user.name,
        authType: user.authType,
        allCardsByViews,
        topSubCards,
        countCards: allCardsByViews.length,
      };
    }));

    router.delete('/deactivate', handle(async (req) => {
      const uuid = userUuid(req);
      await this.auth.deactivateAccount(uuid);
      return { ok: true };
    }));

    return router;
  }
}
