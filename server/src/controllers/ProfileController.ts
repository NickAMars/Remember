import { Router } from 'express';
import { inject, injectable } from 'inversify';
import { requireAuth, userUuid } from '../middleware/auth';
import { handle } from '../middleware/http';
import { AuthService } from '../services/AuthService';
import { MasterCardService } from '../services/MasterCardService';
import { TYPES } from '../types';
import type { Controller } from '../interfaces/controller';

@injectable()
export class ProfileController implements Controller {
  basePath = '/api/profile';

  constructor(
    @inject(TYPES.AuthService) private auth: AuthService,
    @inject(TYPES.MasterCardService) private masterCardService: MasterCardService,
  ) {}

  router() {
    const router = Router();
    router.use(requireAuth(this.auth));

    router.get('/', handle(async (req) => {
      const uuid = userUuid(req);
      const user = await this.auth.getUserByUuid(uuid);
      if (!user) return null;
      const topFive = await this.masterCardService.getTopFive(uuid);
      const allCards = await this.masterCardService.getAllForUser(uuid);
      return {
        uuid: user.uuid,
        name: user.name,
        authType: user.authType,
        topfiveMaster: topFive,
        countCards: allCards.length,
      };
    }));

    return router;
  }
}
