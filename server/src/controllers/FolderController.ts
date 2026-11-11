import { Router } from 'express';
import { inject, injectable } from 'inversify';
import { z } from 'zod';
import { requireAuth, userUuid } from '../middleware/auth';
import { handle, parse, uuidParam } from '../middleware/http';
import { AuthService } from '../services/AuthService';
import { FolderService } from '../services/FolderService';
import { TYPES } from '../types';
import type { Controller } from '../interfaces/controller';
import { MAX_FOLDER_NAME_LENGTH, MAX_QUIZ_QUESTIONS } from '../constants';
import { UUID_REGEX, UUID_ROUTE_PATTERN } from '../utils/validation';

const MAX_DECKS_PER_FOLDER = 1000;
const nameBody = z.object({ name: z.string().trim().min(1).max(MAX_FOLDER_NAME_LENGTH) });
const decksBody = z.object({ masterCardUuids: z.array(z.string().regex(UUID_REGEX)).max(MAX_DECKS_PER_FOLDER) });
const quizQuery = z.object({
  count: z.coerce.number().int().min(0).max(MAX_QUIZ_QUESTIONS).optional(),
  // A comma separated list of deck uuids.
  decks: z.string().max(MAX_DECKS_PER_FOLDER * 37).optional(),
});

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

    const folderPath = `/:uuid(${UUID_ROUTE_PATTERN})`;

    router.get('/', handle(async (request) => this.service.list(userUuid(request))));

    router.get('/decks', handle(async (request) => this.service.decks(userUuid(request))));

    router.post('/', handle(async (request) => {
      const { name } = parse(nameBody, request.body);
      return this.service.create(userUuid(request), name);
    }));

    router.get(folderPath, handle(async (request) => this.service.get(uuidParam(request), userUuid(request))));

    router.put(folderPath, handle(async (request) => {
      const { name } = parse(nameBody, request.body);
      return this.service.rename(uuidParam(request), userUuid(request), name);
    }));

    router.delete(folderPath, handle(async (request) => {
      await this.service.delete(uuidParam(request), userUuid(request));
      return { ok: true };
    }));

    router.put(`${folderPath}/decks`, handle(async (request) => {
      const { masterCardUuids } = parse(decksBody, request.body);
      return this.service.setDecks(uuidParam(request), userUuid(request), masterCardUuids);
    }));

    // Bug fix: these ids were passed through unchecked, so a bad id reached the database.
    router.delete(`${folderPath}/decks/:deckUuid(${UUID_ROUTE_PATTERN})`, handle(async (request) =>
      this.service.removeDeck(uuidParam(request), userUuid(request), uuidParam(request, 'deckUuid'))));

    // ?count=20 limits the number of questions; ?decks=uuid1,uuid2 limits which decks are used.
    router.get(`${folderPath}/quiz`, handle(async (request) => {
      const { count, decks } = parse(quizQuery, request.query);
      const deckUuids = decks
        ? decks.split(',').map((deckUuid) => deckUuid.trim()).filter((deckUuid) => UUID_REGEX.test(deckUuid))
        : undefined;
      return this.service.quiz(uuidParam(request), userUuid(request), count, deckUuids);
    }));

    return router;
  }
}
