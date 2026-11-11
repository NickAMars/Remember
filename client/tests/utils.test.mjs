// Run with: npm test   (uses Node's built-in test runner through tsx; no extra packages)
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { parseCsv, rowsToCards } from '../src/utils/spreadsheet';
import { cleanWrongAnswers, MAX_WRONG_ANSWERS } from '../src/utils/wrongAnswers';
import masterCardModule from '../src/reducer/master_card';
// The source files are ES modules without a package "type", so the default export can arrive wrapped.
const masterCardReducer = masterCardModule.default || masterCardModule;
import { ADD_MASTER, MYCARDS, UPDATE_TIME, DELETE_MASTER } from '../src/actions/types';
import { validateRegistration } from '../src/components/Helper/Form/registerValidation';

globalThis.window = { location: { origin: 'http://localhost' } };
const { safeHref } = await import('../src/utils/safeLink');

test('safeHref keeps http(s) links and drops script links', () => {
  assert.equal(safeHref('https://aws.amazon.com/s3/'), 'https://aws.amazon.com/s3/');
  assert.equal(safeHref('javascript:alert(1)'), null);
  assert.equal(safeHref('data:text/html,hi'), null);
  assert.equal(safeHref(''), null);
  assert.equal(safeHref(undefined), null);
});

test('parseCsv handles quotes, commas and new lines inside cells', () => {
  assert.deepEqual(parseCsv('Question,Answer\n"What is S3, really?","Object ""storage""\nfor files"\r\nQ2,A2'), [
    ['Question', 'Answer'],
    ['What is S3, really?', 'Object "storage"\nfor files'],
    ['Q2', 'A2'],
  ]);
});

test('rowsToCards skips the header, empty questions and keeps the last duplicate', () => {
  const cards = rowsToCards([
    ['Question', 'Answer', 'Link'],
    ['Q1', 'first', ''],
    ['', 'no question'],
    ['Q1', 'second', 'https://example.com'],
  ]);
  assert.deepEqual(cards, [{ title: 'Q1', description: 'second', link: 'https://example.com', wrongAnswers: [] }]);
});

test('rowsToCards reads wrong answers from column D onward', () => {
  const cards = rowsToCards([
    ['Question', 'Answer', 'Link', 'Wrong 1', 'Wrong 2', 'Wrong 3'],
    ['Capital of France?', 'Paris', '', 'Lyon', null, 'Marseille', 'paris', 'lyon', 'Nice'],
  ]);
  assert.deepEqual(cards[0].wrongAnswers, ['Lyon', 'Marseille', 'Nice']);
});

test('cleanWrongAnswers trims, drops repeats and the right answer, and caps the list', () => {
  assert.deepEqual(cleanWrongAnswers([' Lyon ', '', 'LYON', 'Paris', 'Nice'], 'paris'), ['Lyon', 'Nice']);
  const manyAnswers = Array.from({ length: MAX_WRONG_ANSWERS + 3 }, (_unused, position) => `Answer ${position}`);
  assert.equal(cleanWrongAnswers(manyAnswers, 'right').length, MAX_WRONG_ANSWERS);
  assert.deepEqual(cleanWrongAnswers(undefined), []);
});

test('rowsToCards keeps row 1 when it is a real card', () => {
  assert.equal(rowsToCards([['What is EC2?', 'Servers']]).length, 1);
});

test('saving study time only changes that deck, not the whole list', () => {
  const state = masterCardReducer(undefined, { type: MYCARDS, payload: [{ uuid: 'a', timespent: 0 }, { uuid: 'b', timespent: 5 }], total: 2 });
  const next = masterCardReducer(state, { type: UPDATE_TIME, payload: { uuid: 'a', timespent: 60 } });
  assert.deepEqual(next.items, [{ uuid: 'a', timespent: 60 }, { uuid: 'b', timespent: 5 }]);
  assert.equal(next.total, 2);
});

test('a new or copied deck is added to the front of the list', () => {
  const state = masterCardReducer({ items: [{ uuid: 'a' }], total: 1 }, { type: ADD_MASTER, payload: { uuid: 'b' } });
  assert.deepEqual(state, { items: [{ uuid: 'b' }, { uuid: 'a' }], total: 2 });
});

test('deleting a deck lowers the total', () => {
  const state = masterCardReducer({ items: [{ uuid: 'a' }], total: 3 }, { type: DELETE_MASTER, payload: 'a' });
  assert.deepEqual(state, { items: [], total: 2 });
});

test('registration needs a valid username and an 8 character password', () => {
  assert.match(validateRegistration('ab', 'longenough'), /Username/);
  assert.match(validateRegistration('<script>', 'longenough'), /Username/);
  assert.match(validateRegistration('marsden', 'short'), /at least 8/);
  assert.equal(validateRegistration('marsden_01', 'longenough'), '');
});
