import { Router } from 'express';
import { inject, injectable } from 'inversify';
import { z } from 'zod';
import { requireAuth, userUuid } from '../middleware/auth';
import { handle, parse, uuidParam } from '../middleware/http';
import { AuthService } from '../services/AuthService';
import { FolderService } from '../services/FolderService';
import { TYPES } from '../types';
import type { Controller } from '../interfaces/controller';

const nameBody = z.object({ name: z.string().trim().min(1).max(255) });
const decksBody = z.object({ masterCardUuids: z.array(z.string().uuid()).max(1000) });

@injectable()
export class FolderController implements Controller {
  basePath = '/api/folders';

  constructor(
    @inject(TYPES.AuthService) private auth: AuthService,
    @inject(TYPES.FolderService) private service: FolderService,
  ) {}

  router() {
    const router = Router();
    router.use(requireAuth(this.auth));

    router.get('/', handle(async (req) => this.service.list(userUuid(req))));

    router.get('/decks', handle(async (req) => this.service.decks(userUuid(req))));

    router.post('/', handle(async (req) => {
      const { name } = parse(nameBody, req.body);
      return this.service.create(userUuid(req), name);
    }));

    router.get('/:uuid', handle(async (req) => this.service.get(uuidParam(req), userUuid(req))));

    router.put('/:uuid', handle(async (req) => {
      const { name } = parse(nameBody, req.body);
      return this.service.rename(uuidParam(req), userUuid(req), name);
    }));

    router.delete('/:uuid', handle(async (req) => {
      await this.service.delete(uuidParam(req), userUuid(req));
      return { ok: true };
    }));

    router.put('/:uuid/decks', handle(async (req) => {
      const { masterCardUuids } = parse(decksBody, req.body);
      return this.service.setDecks(uuidParam(req), userUuid(req), masterCardUuids);
    }));

    router.delete('/:uuid/decks/:deckUuid', handle(async (req) => {
      return this.service.removeDeck(req.params.uuid, userUuid(req), req.params.deckUuid);
    }));

    // ?count=20 limits the number of questions; ?decks=uuid1,uuid2 limits which decks are used.
    router.get('/:uuid/quiz', handle(async (req) => {
      const { count, decks } = parse(z.object({
        count: z.coerce.number().int().min(0).max(1000).optional(),
        decks: z.string().optional(),
      }), req.query);
      const deckUuids = decks ? decks.split(',').map(s => s.trim()).filter(Boolean) : undefined;
      return this.service.quiz(uuidParam(req), userUuid(req), count, deckUuids);
    }));

    return router;
  }
}
