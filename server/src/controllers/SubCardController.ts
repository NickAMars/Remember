import { Router } from 'express';
import { inject, injectable } from 'inversify';
import { z } from 'zod';
import { requireAuth, userUuid } from '../middleware/auth';
import { handle, parse, uuidParam } from '../middleware/http';
import { spreadsheetUpload } from '../middleware/upload';
import { HttpError } from '../services/errors';
import { AuthService } from '../services/AuthService';
import { SubCardService } from '../services/SubCardService';
import { TYPES } from '../types';
import type { Controller } from '../interfaces/controller';
import { MAX_CARDS_PER_REQUEST, MAX_SEARCH_LENGTH } from '../constants';
import { assertSupportedSpreadsheet, readSpreadsheet } from '../utils/spreadsheet';
import { answerField, linkField, wrongAnswersField, paginationQuery, questionField, resolvePagination, UUID_REGEX, UUID_ROUTE_PATTERN } from '../utils/validation';

const cardBody = z.object({
  title: questionField,
  descriptions: answerField,
  link: linkField,
  markedForReview: z.boolean().optional().default(false),
  wrongAnswers: wrongAnswersField,
});

/** Mark many cards for review at once: the picked cards, or every card in the deck. */
const reviewManyBody = z.object({
  markedForReview: z.boolean(),
  cardUuids: z.array(z.string().regex(UUID_REGEX)).max(MAX_CARDS_PER_REQUEST).optional(),
  allCards: z.boolean().optional().default(false),
  search: z.string().trim().max(MAX_SEARCH_LENGTH).optional(),
}).refine((body) => body.allCards || (body.cardUuids?.length ?? 0) > 0, {
  message: 'Pick at least one card, or choose all cards',
});

const cardListQuery = paginationQuery.extend({
  shuffle: z.enum(['true', 'false']).optional(),
});

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
    const deckPath = `/:uuid(${UUID_ROUTE_PATTERN})`;
    const cardPath = `/subcards/:uuid(${UUID_ROUTE_PATTERN})`;

    router.get(`${deckPath}/subcards/top-viewed`, handle(async (request) =>
      this.service.getTopViewed(uuidParam(request), userUuid(request))));

    router.get(`${deckPath}/subcards`, handle(async (request) => {
      const { shuffle, ...query } = parse(cardListQuery, request.query);
      return this.service.getForMasterCard(uuidParam(request), userUuid(request), resolvePagination(query), shuffle === 'true');
    }));

    router.post(`${deckPath}/subcards`, handle(async (request) => {
      const { title, descriptions, link, wrongAnswers, markedForReview } = parse(cardBody, request.body);
      return this.service.add(uuidParam(request), userUuid(request), title, descriptions, link, wrongAnswers, markedForReview);
    }));

    router.put(`${deckPath}/subcards/review`, handle(async (request) => {
      const { markedForReview, cardUuids, allCards, search } = parse(reviewManyBody, request.body);
      return this.service.setReviewForMany(uuidParam(request), userUuid(request), markedForReview, { cardUuids, allCards, search });
    }));

    router.put(`${cardPath}/view`, handle(async (request) => {
      // Security: views only count on the user's own cards.
      await this.service.incrementViews(uuidParam(request), userUuid(request));
      return { ok: true };
    }));

    router.put(cardPath, handle(async (request) => {
      const { title, descriptions, link, wrongAnswers, markedForReview } = parse(cardBody, request.body);
      return this.service.update(uuidParam(request), userUuid(request), title, descriptions, link, wrongAnswers, markedForReview);
    }));

    /** Add the first sheet's cards to a deck. Questions already in the deck are updated. */
    router.post(`${deckPath}/subcards/upload`, spreadsheetUpload, handle(async (request) => {
      if (!request.file) throw new HttpError(400, 'No file uploaded');
      const extension = assertSupportedSpreadsheet(request.file.originalname);
      const [firstSheet] = await readSpreadsheet(request.file.buffer, extension);
      if (!firstSheet) throw new HttpError(400, 'No worksheet found in file');
      if (firstSheet.cards.length === 0) throw new HttpError(400, 'No valid cards found');

      const result = await this.service.addBulk(uuidParam(request), userUuid(request), firstSheet.cards);
      return { count: firstSheet.cards.length, added: result.added, updated: result.updated };
    }));

    router.delete(cardPath, handle(async (request) => {
      await this.service.delete(uuidParam(request), userUuid(request));
      return { ok: true };
    }));

    return router;
  }
}
