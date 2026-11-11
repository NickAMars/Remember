import { Router } from 'express';
import { inject, injectable } from 'inversify';
import { z } from 'zod';
import { requireAuth, userUuid } from '../middleware/auth';
import { handle, parse, uuidParam } from '../middleware/http';
import { spreadsheetUpload } from '../middleware/upload';
import { HttpError } from '../services/errors';
import { AuthService } from '../services/AuthService';
import { MasterCardService } from '../services/MasterCardService';
import { TYPES } from '../types';
import type { Controller } from '../interfaces/controller';
import { MAX_CARDS_PER_REQUEST, MAX_DECK_TITLE_LENGTH, MAX_STUDY_SESSION_MS } from '../constants';
import { assertSupportedSpreadsheet, dedupeByQuestion, readSpreadsheet } from '../utils/spreadsheet';
import { answerField, linkField, wrongAnswersField, paginationQuery, questionField, resolvePagination, UUID_ROUTE_PATTERN } from '../utils/validation';

const deckTitleField = z.string().trim().min(1).max(MAX_DECK_TITLE_LENGTH);

const createDeckBody = z.object({
  title: deckTitleField,
  cards: z.array(z.object({
    title: questionField,
    description: answerField,
    link: linkField,
    wrongAnswers: wrongAnswersField,
  })).max(MAX_CARDS_PER_REQUEST),
});

const updateDeckBody = z.object({
  title: deckTitleField,
  date: z.string().max(64).optional(),
});

/** Study time in milliseconds, capped so one request can't add years of time. */
const recordTimeBody = z.object({
  time: z.number().finite().nonnegative().max(MAX_STUDY_SESSION_MS),
});

/** File name without its extension, used to name a deck made from a CSV file. */
const baseName = (fileName: string) => fileName.replace(/\.[^.]+$/, '');

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
    const deckPath = `/:uuid(${UUID_ROUTE_PATTERN})`;

    router.get('/', handle(async (request) => {
      const pagination = resolvePagination(parse(paginationQuery, request.query));
      return this.service.getAllForUser(userUuid(request), pagination);
    }));

    /** Create one deck per sheet. A sheet that fails (for example a duplicate title) is reported, not fatal. */
    router.post('/upload', spreadsheetUpload, handle(async (request) => {
      if (!request.file) throw new HttpError(400, 'No file uploaded');
      const extension = assertSupportedSpreadsheet(request.file.originalname);
      const sheets = await readSpreadsheet(request.file.buffer, extension);

      const imported: { title: string; cardCount: number }[] = [];
      const skipped: { title: string; reason: string }[] = [];

      for (const sheet of sheets) {
        const deckTitle = (extension === 'csv' ? baseName(request.file.originalname) : sheet.sheetName)
          .trim()
          .slice(0, MAX_DECK_TITLE_LENGTH) || 'Imported deck';
        const cards = dedupeByQuestion(sheet.cards);
        if (cards.length === 0) continue;

        try {
          await this.service.create(
            userUuid(request),
            deckTitle,
            cards.map((card) => ({
              title: card.title, description: card.descriptions, link: card.link, wrongAnswers: card.wrongAnswers,
            })),
          );
          imported.push({ title: deckTitle, cardCount: cards.length });
        } catch (error) {
          if (error instanceof HttpError && error.status < 500) {
            skipped.push({ title: deckTitle, reason: error.message });
          } else {
            throw error;
          }
        }
      }

      if (imported.length === 0) {
        const reason = skipped[0]?.reason
          ?? 'No valid cards found. Use column A for questions and column B for answers.';
        throw new HttpError(400, reason);
      }
      return { imported, skipped };
    }));

    router.get(deckPath, handle(async (request) => this.service.getOne(uuidParam(request), userUuid(request))));

    router.post('/', handle(async (request) => {
      const { title, cards } = parse(createDeckBody, request.body);
      return this.service.create(userUuid(request), title, cards);
    }));

    router.put(deckPath, handle(async (request) => {
      const { title, date } = parse(updateDeckBody, request.body);
      return this.service.update(uuidParam(request), userUuid(request), title, date);
    }));

    router.delete(deckPath, handle(async (request) => {
      await this.service.delete(uuidParam(request), userUuid(request));
      return { ok: true };
    }));

    router.put(`/time${deckPath}`, handle(async (request) => {
      const { time } = parse(recordTimeBody, request.body);
      return this.service.recordTime(uuidParam(request), userUuid(request), time);
    }));

    return router;
  }
}
