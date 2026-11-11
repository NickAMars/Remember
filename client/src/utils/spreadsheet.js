import { readSheet } from 'read-excel-file/browser';
import { MAX_UPLOAD_BYTES } from '../constance';
import { cleanWrongAnswers } from './wrongAnswers';

const QUESTION_HEADERS = new Set(['title', 'question', 'questions']);
const ANSWER_HEADERS = new Set(['answer', 'answers', 'description', 'descriptions']);
const MAX_QUESTION_LENGTH = 1000;
const MAX_ANSWER_LENGTH = 5000;
const MAX_LINK_LENGTH = 2000;

/** Split CSV text into rows of cells. Handles quoted cells with commas, quotes and new lines. */
export function parseCsv(text) {
  const rows = [];
  let row = [];
  let cell = '';
  let insideQuotes = false;
  for (let position = 0; position < text.length; position++) {
    const character = text[position];
    if (insideQuotes) {
      if (character === '"' && text[position + 1] === '"') { cell += '"'; position++; }
      else if (character === '"') insideQuotes = false;
      else cell += character;
    } else if (character === '"') insideQuotes = true;
    else if (character === ',') { row.push(cell); cell = ''; }
    else if (character === '\n' || character === '\r') {
      if (character === '\r' && text[position + 1] === '\n') position++;
      row.push(cell); rows.push(row); row = []; cell = '';
    } else cell += character;
  }
  if (cell !== '' || row.length > 0) { row.push(cell); rows.push(row); }
  return rows;
}

/**
 * Turn spreadsheet rows into cards: column A question, B answer, C link,
 * D and onward wrong answers (similar but incorrect, for multiple-choice quizzes).
 * A header row is skipped, and a repeated question keeps its last answer
 * (the server refuses a deck with the same question twice).
 */
export function rowsToCards(rows) {
  const cardsByQuestion = new Map();
  rows.forEach((row, rowIndex) => {
    const question = String(row[0] ?? '').trim().slice(0, MAX_QUESTION_LENGTH);
    const answer = String(row[1] ?? '').trim().slice(0, MAX_ANSWER_LENGTH);
    const link = String(row[2] ?? '').trim().slice(0, MAX_LINK_LENGTH);
    if (!question) return;
    if (rowIndex === 0 && (QUESTION_HEADERS.has(question.toLowerCase()) || ANSWER_HEADERS.has(answer.toLowerCase()))) return;
    const wrongAnswers = cleanWrongAnswers(row.slice(3), answer);
    cardsByQuestion.set(question, { title: question, description: answer, link, wrongAnswers });
  });
  return [...cardsByQuestion.values()];
}

/** Read the first sheet of an .xlsx or .csv file into cards. Throws an Error with a friendly message. */
export async function readCardsFromFile(file) {
  const extension = file.name.split('.').pop().toLowerCase();
  if (extension === 'xls') throw new Error('Old .xls files are not supported. Open it in Excel and save as .xlsx.');
  if (!['xlsx', 'csv'].includes(extension)) throw new Error('Please upload an .xlsx or .csv file');
  if (file.size > MAX_UPLOAD_BYTES) throw new Error('File is too large (5 MB max)');
  // Bug fix: CSV files were passed to the Excel reader, which can't read them.
  const rows = extension === 'csv' ? parseCsv(await file.text()) : await readSheet(file);
  return rowsToCards(rows);
}
