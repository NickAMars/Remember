import ExcelJS from 'exceljs';
import { assertSupportedSpreadsheet, cellText, dedupeByQuestion, isHeaderRow, readSpreadsheet } from '../utils/spreadsheet';
import { MAX_QUESTION_LENGTH } from '../constants';

async function workbookBuffer(sheets: Record<string, unknown[][]>): Promise<Buffer> {
  const workbook = new ExcelJS.Workbook();
  for (const [sheetName, rows] of Object.entries(sheets)) {
    const worksheet = workbook.addWorksheet(sheetName);
    rows.forEach((row) => worksheet.addRow(row));
  }
  return Buffer.from(await workbook.xlsx.writeBuffer());
}

describe('cellText', () => {
  it('reads plain values', () => {
    expect(cellText('hello')).toBe('hello');
    expect(cellText(42)).toBe('42');
    expect(cellText(null)).toBe('');
  });

  it('reads rich text, hyperlinks and formulas instead of "[object Object]"', () => {
    expect(cellText({ richText: [{ text: 'Amazon ' }, { text: 'S3' }] } as ExcelJS.CellValue)).toBe('Amazon S3');
    expect(cellText({ text: 'AWS docs', hyperlink: 'https://aws.amazon.com' } as ExcelJS.CellValue)).toBe('AWS docs');
    expect(cellText({ formula: 'A1&B1', result: 'joined' } as ExcelJS.CellValue)).toBe('joined');
  });
});

describe('assertSupportedSpreadsheet', () => {
  it('accepts .xlsx and .csv', () => {
    expect(assertSupportedSpreadsheet('deck.xlsx')).toBe('xlsx');
    expect(assertSupportedSpreadsheet('DECK.CSV')).toBe('csv');
  });

  it('explains that old .xls files must be re-saved', () => {
    expect(() => assertSupportedSpreadsheet('old.xls')).toThrow(/xlsx/);
  });

  it('rejects other files', () => {
    expect(() => assertSupportedSpreadsheet('virus.exe')).toThrow();
    expect(() => assertSupportedSpreadsheet('noextension')).toThrow();
  });
});

describe('isHeaderRow', () => {
  it('spots common headers', () => {
    expect(isHeaderRow('Question', 'Answer')).toBe(true);
    expect(isHeaderRow('Title', '')).toBe(true);
    expect(isHeaderRow('Q1', 'A')).toBe(false);
    expect(isHeaderRow('Something', 'Answer')).toBe(true);
    expect(isHeaderRow('What is S3?', 'Object storage')).toBe(false);
  });
});

describe('readSpreadsheet', () => {
  it('reads every sheet, skips the header row and cleans links', async () => {
    const buffer = await workbookBuffer({
      Storage: [
        ['Question', 'Answer', 'Link'],
        ['What is S3?', 'Object storage', 'aws.amazon.com/s3'],
        ['What is EBS?', 'Block storage', 'javascript:alert(1)'],
        ['', 'row without a question is skipped'],
      ],
      Compute: [['What is EC2?', 'Virtual servers']],
    });

    const sheets = await readSpreadsheet(buffer, 'xlsx');

    expect(sheets.map((sheet) => sheet.sheetName)).toEqual(['Storage', 'Compute']);
    expect(sheets[0].cards).toEqual([
      { title: 'What is S3?', descriptions: 'Object storage', link: 'https://aws.amazon.com/s3' },
      { title: 'What is EBS?', descriptions: 'Block storage', link: '' },
    ]);
    // No header on this sheet, so row 1 is a card.
    expect(sheets[1].cards).toHaveLength(1);
  });

  it('cuts very long questions to the column size', async () => {
    const buffer = await workbookBuffer({ Long: [['x'.repeat(MAX_QUESTION_LENGTH + 50), 'long answer']] });
    const [sheet] = await readSpreadsheet(buffer, 'xlsx');
    expect(sheet.cards[0].title).toHaveLength(MAX_QUESTION_LENGTH);
  });

  it('reads CSV files', async () => {
    const buffer = Buffer.from('Question,Answer\nWhat is IAM?,Identity and access\n');
    const [sheet] = await readSpreadsheet(buffer, 'csv');
    expect(sheet.cards).toEqual([{ title: 'What is IAM?', descriptions: 'Identity and access', link: '' }]);
  });

  it('gives a clear error for a file that is not a spreadsheet', async () => {
    await expect(readSpreadsheet(Buffer.from('not a zip file'), 'xlsx')).rejects.toMatchObject({ status: 400 });
  });
});

describe('dedupeByQuestion', () => {
  it('keeps the last card for each question', () => {
    expect(dedupeByQuestion([
      { title: 'Q', descriptions: 'first' },
      { title: 'Q', descriptions: 'second' },
      { title: 'R', descriptions: 'other' },
    ])).toEqual([{ title: 'Q', descriptions: 'second' }, { title: 'R', descriptions: 'other' }]);
  });
});
