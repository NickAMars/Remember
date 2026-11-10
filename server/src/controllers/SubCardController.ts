import { Router } from 'express';
import multer from 'multer';
import { inject, injectable } from 'inversify';
import { z } from 'zod';
import * as XLSX from 'xlsx';
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
      return this.service.getForMasterCard(uuidParam(req), page, pageSize, search);
    }));

    router.post('/:uuid/subcards', handle(async (req) => {
      const { title, descriptions } = parse(z.object({
        title: z.string().min(1).max(1000),
        descriptions: z.string().max(5000).default(''),
      }), req.body);
      return this.service.add(uuidParam(req), userUuid(req), title, descriptions);
    }));

    router.put('/subcards/:uuid/view', handle(async (req) => {
      await this.service.incrementViews(uuidParam(req));
      return { ok: true };
    }));

    router.put('/subcards/:uuid', handle(async (req) => {
      const { title, descriptions } = parse(z.object({
        title: z.string().min(1).max(1000),
        descriptions: z.string().max(5000).default(''),
      }), req.body);
      return this.service.update(uuidParam(req), userUuid(req), title, descriptions);
    }));

    router.post('/:uuid/subcards/upload', upload.single('file'), handle(async (req) => {
      if (!req.file) throw new HttpError(400, 'No file uploaded');
      const ext = req.file.originalname.split('.').pop()?.toLowerCase();
      if (!ext || !['xlsx', 'xls', 'csv'].includes(ext)) {
        throw new HttpError(400, 'File must be .xlsx, .xls, or .csv');
      }
      const workbook = XLSX.read(req.file.buffer, { type: 'buffer' });
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const rows: string[][] = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: '' });

      const cards: { title: string; descriptions: string }[] = [];
      const firstCell = rows.length > 0 ? String(rows[0][0]).toLowerCase() : '';
      const startRow = (firstCell === 'title' || firstCell === 'question') ? 1 : 0;
      for (let i = startRow; i < rows.length; i++) {
        let title = String(rows[i][0] || '').trim();
        let descriptions = String(rows[i][1] || '').trim();
        if (title.length > 1000) title = title.slice(0, 1000);
        if (descriptions.length > 5000) descriptions = descriptions.slice(0, 5000);
        if (title) cards.push({ title, descriptions });
      }
      if (cards.length === 0) throw new HttpError(400, 'No valid cards found');

      await this.service.addBulk(uuidParam(req), userUuid(req), cards);
      return { count: cards.length };
    }));

    router.delete('/subcards/:uuid', handle(async (req) => {
      await this.service.delete(uuidParam(req), userUuid(req));
      return { ok: true };
    }));

    return router;
  }
}
