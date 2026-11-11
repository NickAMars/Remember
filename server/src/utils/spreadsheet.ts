import { Readable } from 'node:stream';
import ExcelJS from 'exceljs';
import { MAX_ANSWER_LENGTH, MAX_CARDS_PER_REQUEST, MAX_QUESTION_LENGTH, MAX_WRONG_ANSWERS } from '../constants';
import { HttpError } from '../services/errors';
import { cleanWrongAnswers, normalizeLink } from './validation';

/** One question/answer row read from a spreadsheet. */
export interface SpreadsheetCard {
  title: string;
  descriptions: string;
  link: string;
  /** Columns D and onward: similar but incorrect answers for Quiz mode. */
  wrongAnswers: string[];
}

/** Column D is the first wrong answer. */
export const FIRST_WRONG_ANSWER_COLUMN = 4;

export interface SpreadsheetSheet {
  sheetName: string;
  cards: SpreadsheetCard[];
}

export const SUPPORTED_SPREADSHEET_EXTENSIONS = ['xlsx', 'csv'] as const;
const QUESTION_HEADER_WORDS = new Set(['title', 'question', 'questions']);
const ANSWER_HEADER_WORDS = new Set(['answer', 'answers', 'description', 'descriptions']);

/**
 * Read the text of one Excel cell. ExcelJS returns objects for hyperlinks, rich text,
 * formulas and dates, and `String(object)` would give "[object Object]".
 */
export function cellText(value: ExcelJS.CellValue): string {
  if (value === null || value === undefined) return '';
  if (value instanceof Date) return value.toISOString();
  if (typeof value !== 'object') return String(value);
  if ('richText' in value) return value.richText.map((part) => part.text).join('');
  if ('hyperlink' in value) {
    const hyperlinkCell = value as ExcelJS.CellHyperlinkValue;
    return typeof hyperlinkCell.text === 'string' ? hyperlinkCell.text : cellText(hyperlinkCell.text as ExcelJS.CellValue);
  }
  if ('result' in value) return cellText((value as ExcelJS.CellFormulaValue).result as ExcelJS.CellValue);
  if ('error' in value) return '';
  return '';
}

/** The link of a cell: the hyperlink target when there is one, otherwise its text. */
function cellLink(value: ExcelJS.CellValue): string {
  if (value && typeof value === 'object' && 'hyperlink' in value) {
    return normalizeLink((value as ExcelJS.CellHyperlinkValue).hyperlink);
  }
  return normalizeLink(cellText(value));
}

export function fileExtension(fileName: string): string {
  return (fileName.split('.').pop() || '').toLowerCase();
}

/** Throw a friendly 400 unless the file is a type we can read. */
export function assertSupportedSpreadsheet(fileName: string): 'xlsx' | 'csv' {
  const extension = fileExtension(fileName);
  if (extension === 'xls') {
    throw new HttpError(400, 'Old .xls files are not supported. Open the file in Excel and save it as .xlsx or .csv.');
  }
  if (!(SUPPORTED_SPREADSHEET_EXTENSIONS as readonly string[]).includes(extension)) {
    throw new HttpError(400, 'File must be .xlsx or .csv');
  }
  return extension as 'xlsx' | 'csv';
}

/** Row 1 is a header when column A says "Question"/"Title" or column B says "Answer". */
export function isHeaderRow(questionText: string, answerText: string): boolean {
  return QUESTION_HEADER_WORDS.has(questionText.toLowerCase()) || ANSWER_HEADER_WORDS.has(answerText.toLowerCase());
}

/**
 * Read every sheet of a workbook into cards.
 * Column A = question, column B = answer, column C = optional link,
 * columns D and onward = optional wrong answers for Quiz mode.
 * A header row (see isHeaderRow) is skipped.
 */
export async function readSpreadsheet(buffer: Buffer, extension: 'xlsx' | 'csv'): Promise<SpreadsheetSheet[]> {
  const workbook = new ExcelJS.Workbook();
  try {
    if (extension === 'csv') {
      await workbook.csv.read(Readable.from(buffer));
    } else {
      await workbook.xlsx.load(buffer as unknown as ArrayBuffer);
    }
  } catch {
    throw new HttpError(400, 'Could not read the file. Make sure it is a valid .xlsx or .csv file.');
  }

  let totalCards = 0;
  const sheets: SpreadsheetSheet[] = [];
  for (const worksheet of workbook.worksheets) {
    const cards: SpreadsheetCard[] = [];
    worksheet.eachRow((row, rowNumber) => {
      const title = cellText(row.getCell(1).value).trim().slice(0, MAX_QUESTION_LENGTH);
      if (!title) return;
      const answer = cellText(row.getCell(2).value).trim().slice(0, MAX_ANSWER_LENGTH);
      if (rowNumber === 1 && isHeaderRow(title, answer)) return;
      cards.push({
        title,
        descriptions: answer,
        link: cellLink(row.getCell(3).value),
        wrongAnswers: readWrongAnswers(row, answer),
      });
    });
    totalCards += cards.length;
    // Security: stop very large files from tying up the server.
    if (totalCards > MAX_CARDS_PER_REQUEST) {
      throw new HttpError(400, `A file can hold at most ${MAX_CARDS_PER_REQUEST} cards`);
    }
    sheets.push({ sheetName: worksheet.name, cards });
  }
  return sheets;
}

/** Read the wrong answers from column D onward. Stops after a few extra columns so a wide sheet stays cheap. */
function readWrongAnswers(row: ExcelJS.Row, rightAnswer: string): string[] {
  const lastColumn = Math.min(row.cellCount, FIRST_WRONG_ANSWER_COLUMN + MAX_WRONG_ANSWERS * 2 - 1);
  const rawAnswers: string[] = [];
  for (let columnNumber = FIRST_WRONG_ANSWER_COLUMN; columnNumber <= lastColumn; columnNumber++) {
    rawAnswers.push(cellText(row.getCell(columnNumber).value));
  }
  return cleanWrongAnswers(rawAnswers, rightAnswer);
}

/** Keep the last card for each question, so a repeated question updates instead of failing. */
export function dedupeByQuestion<Card extends { title: string }>(cards: Card[]): Card[] {
  const cardsByQuestion = new Map<string, Card>();
  for (const card of cards) cardsByQuestion.set(card.title, card);
  return [...cardsByQuestion.values()];
}
