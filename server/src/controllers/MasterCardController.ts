import { Router } from 'express';
import multer from 'multer';
import { inject, injectable } from 'inversify';
import { z } from 'zod';
import * as XLSX from 'xlsx';
import { requireAuth, userUuid } from '../middleware/auth';
import { handle, parse, uuidParam } from '../middleware/http';
import { HttpError } from '../services/errors';
import { AuthService } from '../services/AuthService';
import { MasterCardService } from '../services/MasterCardService';
import { TYPES } from '../types';
import type { Controller } from '../interfaces/controller';

const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 5 * 1024 * 1024 } });

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

    router.get('/', handle(async (req) => {
      return this.service.getAllForUser(userUuid(req));
    }));

    router.post('/upload', upload.single('file'), handle(async (req) => {
      if (!req.file) throw new HttpError(400, 'No file uploaded');

      const ext = req.file.originalname.split('.').pop()?.toLowerCase();
      if (!ext || !['xlsx', 'xls', 'csv'].includes(ext)) {
        throw new HttpError(400, 'File must be .xlsx, .xls, or .csv');
      }

      let workbook: XLSX.WorkBook;
      try {
        workbook = XLSX.read(req.file.buffer, { type: 'buffer' });
      } catch {
        throw new HttpError(400, 'Could not read file. Make sure it is a valid Excel or CSV file.');
      }
      const results: { title: string; cardCount: number }[] = [];

      for (const sheetName of workbook.SheetNames) {
        const sheet = workbook.Sheets[sheetName];
        const rows: unknown[][] = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: '' });

        if (rows.length < 2) continue;

        const cards: { title: string; description: string }[] = [];
        for (let i = 1; i < rows.length; i++) {
          const row = rows[i];
          if (!row || !Array.isArray(row)) continue;
          let title = String(row[0] ?? '').trim();
          let description = String(row[1] ?? '').trim();
          if (title.length > 1000) title = title.slice(0, 1000);
          if (description.length > 5000) description = description.slice(0, 5000);
          if (title) cards.push({ title, description });
        }

        if (cards.length === 0) continue;

        await this.service.create(userUuid(req), sheetName, cards);
        results.push({ title: sheetName, cardCount: cards.length });
      }

      if (results.length === 0) {
        throw new HttpError(400, 'No valid cards found. Use column A for questions, column B for answers. Row 1 is treated as a header.');
      }

      return { imported: results };
    }));

    const uuidPattern = '[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}';

    router.get(`/:uuid(${uuidPattern})`, handle(async (req) => {
      return this.service.getOne(uuidParam(req));
    }));

    router.post('/', handle(async (req) => {
      const { title, cards } = parse(z.object({
        title: z.string().min(1).max(128),
        cards: z.array(z.object({
          title: z.string().min(1).max(1000),
          description: z.string().max(5000).default(''),
        })),
      }), req.body);
      return this.service.create(userUuid(req), title, cards);
    }));

    router.put(`/:uuid(${uuidPattern})`, handle(async (req) => {
      const { title, date } = parse(z.object({
        title: z.string().min(1).max(128),
        date: z.string().optional(),
      }), req.body);
      return this.service.update(uuidParam(req), userUuid(req), title, date);
    }));

    router.delete(`/:uuid(${uuidPattern})`, handle(async (req) => {
      await this.service.delete(uuidParam(req), userUuid(req));
      return { ok: true };
    }));

    router.put('/time/:uuid', handle(async (req) => {
      const { time } = parse(z.object({
        time: z.number().nonnegative(),
      }), req.body);
      return this.service.recordTime(uuidParam(req), userUuid(req), time);
    }));

    return router;
  }
}
