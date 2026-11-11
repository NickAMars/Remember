import { Router } from 'express';
import multer from 'multer';
import { inject, injectable } from 'inversify';
import { z } from 'zod';
import ExcelJS from 'exceljs';
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
      const page = req.query.page !== undefined ? parseInt(req.query.page as string, 10) : undefined;
      const pageSize = req.query.pageSize !== undefined ? parseInt(req.query.pageSize as string, 10) : undefined;
      const search = req.query.search ? String(req.query.search) : undefined;
      return this.service.getAllForUser(userUuid(req), page, pageSize, search);
    }));

    router.post('/upload', upload.single('file'), handle(async (req) => {
      if (!req.file) throw new HttpError(400, 'No file uploaded');

      const ext = req.file.originalname.split('.').pop()?.toLowerCase();
      if (!ext || !['xlsx', 'xls', 'csv'].includes(ext)) {
        throw new HttpError(400, 'File must be .xlsx, .xls, or .csv');
      }

      const workbook = new ExcelJS.Workbook();
      try {
        if (ext === 'csv') {
          await workbook.csv.read(req.file.buffer);
        } else {
          await workbook.xlsx.load(req.file.buffer);
        }
      } catch {
        throw new HttpError(400, 'Could not read file. Make sure it is a valid Excel or CSV file.');
      }
      const results: { title: string; cardCount: number }[] = [];

      for (const sheet of workbook.worksheets) {
        if (sheet.rowCount < 2) continue;

        const cards: { title: string; description: string; link: string }[] = [];
        sheet.eachRow((row, rowNumber) => {
          if (rowNumber === 1) return; // skip header
          let title = String(row.getCell(1).value ?? '').trim();
          let description = String(row.getCell(2).value ?? '').trim();
          let link = String(row.getCell(3).value ?? '').trim();
          if (title.length > 1000) title = title.slice(0, 1000);
          if (description.length > 5000) description = description.slice(0, 5000);
          if (link.length > 2000) link = link.slice(0, 2000);
          if (title) cards.push({ title, description, link });
        });

        if (cards.length === 0) continue;

        await this.service.create(userUuid(req), sheet.name, cards);
        results.push({ title: sheet.name, cardCount: cards.length });
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
          link: z.string().max(2000).default(''),
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
