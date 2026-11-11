import multer from 'multer';
import { MAX_UPLOAD_BYTES } from '../constants';

/**
 * Spreadsheet upload: one file, kept in memory, at most MAX_UPLOAD_BYTES.
 * Security: one file and no extra form fields, so a request can't fill memory with parts.
 */
export const spreadsheetUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_UPLOAD_BYTES, files: 1, fields: 5 },
}).single('file');
