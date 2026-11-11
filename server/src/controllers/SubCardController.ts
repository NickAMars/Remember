import { Router } from 'express';
import multer from 'multer';
import { inject, injectable } from 'inversify';
import { z } from 'zod';
import ExcelJS from 'exceljs';
import { requireAuth, userUuid } from '../middleware/auth';
import { handle, parse, uuidParam } from '../middleware/http';
import { HttpError } from '../services/errors';
import { AuthService } from '../services/AuthService';
import { SubCardService } from '../services/SubCardService';
import { TYPES } from '../types';
import type { Controller } from '../interfaces/controller';

const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 5 * 1024 * 1024 } });

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

    router.get('/:uuid/subcards/top-viewed', handle(async (req) => {
      return this.service.getTopViewed(uuidParam(req));
    }));

    router.get('/:uuid/subcards', handle(async (req) => {
      const page = req.query.page !== undefined ? parseInt(req.query.page as string, 10) : undefined;
      const pageSize = req.query.pageSize !== undefined ? parseInt(req.query.pageSize as string, 10) : undefined;
      const search = req.query.search ? String(req.query.search) : undefined;
      const shuffle = req.query.shuffle === 'true';
      return this.service.getForMasterCard(uuidParam(req), page, pageSize, search, shuffle);
    }));

    router.post('/:uuid/subcards', handle(async (req) => {
      const { title, descriptions, link } = parse(z.object({
        title: z.string().min(1).max(1000),
        descriptions: z.string().max(5000).default(''),
        link: z.string().max(2000).default(''),
      }), req.body);
      return this.service.add(uuidParam(req), userUuid(req), title, descriptions, link);
    }));

    router.put('/subcards/:uuid/view', handle(async (req) => {
      await this.service.incrementViews(uuidParam(req));
      return { ok: true };
    }));

    router.put('/subcards/:uuid', handle(async (req) => {
      const { title, descriptions, link } = parse(z.object({
        title: z.string().min(1).max(1000),
        descriptions: z.string().max(5000).default(''),
        link: z.string().max(2000).default(''),
      }), req.body);
      return this.service.update(uuidParam(req), userUuid(req), title, descriptions, link);
    }));

    router.post('/:uuid/subcards/upload', upload.single('file'), handle(async (req) => {
      if (!req.file) throw new HttpError(400, 'No file uploaded');
      const ext = req.file.originalname.split('.').pop()?.toLowerCase();
      if (!ext || !['xlsx', 'xls', 'csv'].includes(ext)) {
        throw new HttpError(400, 'File must be .xlsx, .xls, or .csv');
      }
      const workbook = new ExcelJS.Workbook();
      if (ext === 'csv') {
        await workbook.csv.read(req.file.buffer);
      } else {
        await workbook.xlsx.load(req.file.buffer);
      }
      const sheet = workbook.worksheets[0];
      if (!sheet) throw new HttpError(400, 'No worksheet found in file');

      const cards: { title: string; descriptions: string; link: string }[] = [];
      const firstRow = sheet.getRow(1);
      const firstCell = String(firstRow.getCell(1).value || '').toLowerCase().trim();
      const startRow = ['title', 'question'].includes(firstCell) ? 2 : 1;
      sheet.eachRow((row, rowNumber) => {
        if (rowNumber < startRow) return;
        let title = String(row.getCell(1).value || '').trim();
        let descriptions = String(row.getCell(2).value || '').trim();
        let link = String(row.getCell(3).value || '').trim();
        if (title.length > 1000) title = title.slice(0, 1000);
        if (descriptions.length > 5000) descriptions = descriptions.slice(0, 5000);
        if (link.length > 2000) link = link.slice(0, 2000);
        if (title) cards.push({ title, descriptions, link });
      });
      if (cards.length === 0) throw new HttpError(400, 'No valid cards found');

      const result = await this.service.addBulk(uuidParam(req), userUuid(req), cards);
      return { count: cards.length, added: result.added, updated: result.updated };
    }));

    router.delete('/subcards/:uuid', handle(async (req) => {
      await this.service.delete(uuidParam(req), userUuid(req));
      return { ok: true };
    }));

    return router;
  }
}
