/**
 * End-to-end smoke test against a real, EMPTY Postgres database. It signs up two users and
 * checks that each one can only see and change their own data.
 *
 *   DATABASE_URL=postgres://user@localhost:5432/remember_smoke JWT_SECRET=<32+ chars> npm run test:smoke
 *
 * Never point it at a database with real data: it creates users named alice and bob_2.
 */
import 'reflect-metadata';
import { createHash } from 'node:crypto';
import ExcelJS from 'exceljs';
import { buildContainer } from '../src/container';
import { createApp } from '../src/app';
import { AppDataSource } from '../src/data-source';
import { syncTutorialDecks } from '../src/services/tutorial';

const digest = (password: string) => createHash('sha256').update(password).digest('hex');
let failures = 0;
function check(label: string, condition: boolean, detail?: unknown) {
  console.log(`${condition ? 'PASS' : 'FAIL'}  ${label}${condition ? '' : ' ' + JSON.stringify(detail)}`);
  if (!condition) failures++;
}

async function main() {
  await AppDataSource.initialize();
  const app = createApp(buildContainer(AppDataSource));
  const server = app.listen(0);
  const port = (server.address() as any).port;
  const base = `http://127.0.0.1:${port}`;
  const call = async (method: string, path: string, token?: string, body?: unknown) => {
    const response = await fetch(base + path, {
      method,
      headers: { 'content-type': 'application/json', ...(token ? { authorization: `Bearer ${token}` } : {}) },
      body: body === undefined ? undefined : JSON.stringify(body),
    });
    const text = await response.text();
    return { status: response.status, body: text ? JSON.parse(text) : null };
  };

  const alice = await call('POST', '/auth/signup', undefined, { username: 'alice', passwordDigest: digest('password1') });
  const bob = await call('POST', '/auth/signup', undefined, { username: 'bob_2', passwordDigest: digest('password2') });
  check('signup works', alice.status === 200 && !!alice.body.token, alice);
  const badName = await call('POST', '/auth/signup', undefined, { username: '<x>', passwordDigest: digest('p') });
  check('bad username rejected', badName.status === 400, badName);
  const aliceToken = alice.body.token, bobToken = bob.body.token;

  const login = await call('POST', '/auth/login', undefined, { username: 'alice', passwordDigest: digest('password1') });
  check('login works', login.status === 200, login);

  const decks = await call('GET', '/api/profile/MasterCard?page=0&pageSize=10', aliceToken);
  check('deck list has tutorial with count', decks.status === 200 && decks.body.total === 1 && decks.body.items[0].subCardCount > 0, decks);

  const created = await call('POST', '/api/profile/MasterCard', aliceToken, {
    title: 'AWS', cards: [
      { title: 'What is S3?', description: 'Object storage', link: 'javascript:alert(1)', wrongAnswers: ['Glacier', 'File storage', 'object storage', 'Cold storage', ' Glacier '] },
      { title: 'What is EC2?', description: 'Servers', link: 'aws.amazon.com/ec2' },
      { title: 'What is EBS?', description: 'Block storage' },
      { title: 'What is IAM?', description: 'Identity' },
      { title: '100% sure_', description: 'Wildcards' },
    ],
  });
  check('create deck', created.status === 200 && created.body.subCardCount === 5, created);
  const deckUuid = created.body.uuid;

  const cards = await call('GET', `/api/profile/MasterCard/${deckUuid}/subcards?page=0&pageSize=2`, aliceToken);
  check('paged cards', cards.status === 200 && cards.body.items.length === 2 && cards.body.total === 5, cards);
  const all = await call('GET', `/api/profile/MasterCard/${deckUuid}/subcards?search=%25`, aliceToken);
  check('LIKE % is literal', all.body.total === 1, all.body);
  const s3 = (await call('GET', `/api/profile/MasterCard/${deckUuid}/subcards?search=s3`, aliceToken)).body.items[0];
  check('javascript: link removed', s3.link === '', s3);
  check('wrong answers saved and cleaned', JSON.stringify(s3.wrongAnswers) === JSON.stringify(['Glacier', 'File storage', 'Cold storage']), s3);
  const ec2 = (await call('GET', `/api/profile/MasterCard/${deckUuid}/subcards?search=ec2`, aliceToken)).body.items[0];
  const editedEc2 = await call('PUT', `/api/profile/MasterCard/subcards/${ec2.uuid}`, aliceToken, {
    title: ec2.title, descriptions: ec2.descriptions, link: ec2.link, wrongAnswers: ['Lambda', 'Servers', 'Containers'],
  });
  check('edit wrong answers', editedEc2.status === 200 && JSON.stringify(editedEc2.body.wrongAnswers) === JSON.stringify(['Lambda', 'Containers']), editedEc2);
  const tooMany = await call('PUT', `/api/profile/MasterCard/subcards/${ec2.uuid}`, aliceToken, {
    title: ec2.title, descriptions: ec2.descriptions, wrongAnswers: Array.from({ length: 100 }, (_unused, position) => `x${position}`),
  });
  check('huge wrong answer list rejected', tooMany.status === 400, tooMany);
  const shuffled = await call('GET', `/api/profile/MasterCard/${deckUuid}/subcards?shuffle=true&page=0&pageSize=5`, aliceToken);
  check('shuffle works', shuffled.status === 200 && shuffled.body.items.length === 5, shuffled);

  const bobReads = await call('GET', `/api/profile/MasterCard/${deckUuid}/subcards`, bobToken);
  check("bob can't read alice's cards", bobReads.status === 404, bobReads);
  const bobShares = await call('POST', '/api/poolcards', bobToken, { mastercard: { uuid: deckUuid } });
  check("bob can't share alice's deck", bobShares.status === 404, bobShares);
  const bobView = await call('PUT', `/api/profile/MasterCard/subcards/${s3.uuid}/view`, bobToken);
  const aliceView = await call('PUT', `/api/profile/MasterCard/subcards/${s3.uuid}/view`, aliceToken);
  const topViewed = await call('GET', `/api/profile/MasterCard/${deckUuid}/subcards/top-viewed`, aliceToken);
  check('views: only owner counts', bobView.status === 200 && aliceView.status === 200 && topViewed.body[0]?.views === 1, topViewed);

  const time = await call('PUT', `/api/profile/MasterCard/time/${deckUuid}`, aliceToken, { time: 60000 });
  const time2 = await call('PUT', `/api/profile/MasterCard/time/${deckUuid}`, aliceToken, { time: 30000 });
  check('record time', time.status === 200 && time2.body.timespent === 90000, [time, time2]);
  const tooMuch = await call('PUT', `/api/profile/MasterCard/time/${deckUuid}`, aliceToken, { time: 1e15 });
  check('huge time rejected', tooMuch.status === 400, tooMuch);

  const shared = await call('POST', '/api/poolcards', aliceToken, { mastercard: { uuid: deckUuid } });
  check('share deck', shared.status === 200 && shared.body[0].subCardCount === 5 && !shared.body[0].subCards, shared);
  const publicUuid = shared.body[0].uuid;
  const summary = await call('GET', `/api/poolcards/${publicUuid}/summary`);
  check('public summary', summary.status === 200 && summary.body.title === 'AWS', summary);
  const copy = await call('POST', `/api/poolcards/add/${publicUuid}`, bobToken);
  check('bob copies public deck', copy.status === 200 && copy.body.subCardCount === 5, copy);
  const bobS3 = (await call('GET', `/api/profile/MasterCard/${copy.body.uuid}/subcards?search=s3`, bobToken)).body.items[0];
  check('wrong answers copied through the public deck', bobS3?.wrongAnswers?.length === 3, bobS3);
  const copyAgain = await call('POST', `/api/poolcards/add/${publicUuid}`, bobToken);
  check('second copy refused', copyAgain.status === 400, copyAgain);
  const bobUnshare = await call('DELETE', `/api/poolcards/${publicUuid}`, bobToken);
  check("bob can't unshare alice's deck", bobUnshare.status === 404, bobUnshare);

  const folder = await call('POST', '/api/folders', aliceToken, { name: 'Cloud' });
  const setDecks = await call('PUT', `/api/folders/${folder.body.uuid}/decks`, aliceToken, { masterCardUuids: [deckUuid] });
  check('folder with deck', setDecks.status === 200 && setDecks.body.cardCount === 5, setDecks);
  const bobFolderDeck = await call('POST', '/api/folders', bobToken, { name: 'Steal' });
  const steal = await call('PUT', `/api/folders/${bobFolderDeck.body.uuid}/decks`, bobToken, { masterCardUuids: [deckUuid] });
  check("bob can't put alice's deck in a folder", steal.status === 404, steal);

  const quiz = await call('GET', `/api/folders/${folder.body.uuid}/quiz?count=3`, aliceToken);
  check('quiz: 3 random questions with choices', quiz.status === 200 && quiz.body.cards.length === 3 && quiz.body.available === 5 && quiz.body.cards[0].choices.length === 4, quiz);

  const fullQuiz = await call('GET', `/api/folders/${folder.body.uuid}/quiz`, aliceToken);
  const s3Question = fullQuiz.body.cards.find((card: any) => card.question === 'What is S3?');
  const s3WrongChoices = s3Question.choices.filter((choice: string) => choice !== 'Object storage');
  check('quiz uses the saved wrong answers', s3Question.choices.length === 4
    && s3WrongChoices.every((choice: string) => ['Glacier', 'File storage', 'Cold storage'].includes(choice)), s3Question);
  const ec2Question = fullQuiz.body.cards.find((card: any) => card.question === 'What is EC2?');
  check('quiz fills the gap when fewer than 3 are saved', ec2Question.choices.length === 4
    && ec2Question.choices.includes('Lambda') && ec2Question.choices.includes('Containers'), ec2Question);

  const due = await call('GET', '/api/review/due', aliceToken);
  check('due counts in SQL', due.status === 200 && due.body.total >= 5 && due.body.byFolder[0]?.count === 5, due);
  const results = await call('POST', '/api/review/results', aliceToken, {
    results: quiz.body.cards.map((card: any) => ({ subCardUuid: card.uuid, correct: true, mode: 'flash' })),
  });
  const dueAfter = await call('GET', '/api/review/due', aliceToken);
  check('reviewed cards stop being due', results.status === 200 && dueAfter.body.byFolder[0]?.count === 2, dueAfter);
  const dueCards = await call('GET', `/api/review/due/${folder.body.uuid}?count=10`, aliceToken);
  check('due quiz has the 2 left', dueCards.status === 200 && dueCards.body.available === 2, dueCards);
  const bobReview = await call('POST', '/api/review/results', bobToken, { results: [{ subCardUuid: s3.uuid, correct: true, mode: 'flash' }] });
  const bobRows = await AppDataSource.query(`SELECT count(*) FROM card_reviews r JOIN users u ON u.id = r.user_id WHERE u.name = 'bob_2'`);
  check("bob's review of alice's card ignored", bobReview.status === 200 && bobRows[0].count === '0', bobRows);

  const removeDeck = await call('DELETE', `/api/folders/${folder.body.uuid}/decks/${deckUuid}`, aliceToken);
  check('remove deck from folder', removeDeck.status === 200 && removeDeck.body.decks.length === 0, removeDeck);

  // Upload: two sheets, one with a title that already exists.
  const workbook = new ExcelJS.Workbook();
  workbook.addWorksheet('Networking').addRows([['Question', 'Answer'], ['What is a VPC?', 'Private network'], ['What is a VPC?', 'dup']]);
  workbook.addWorksheet('AWS').addRows([['Q1', 'A1']]);
  const form = new FormData();
  form.append('file', new Blob([await workbook.xlsx.writeBuffer()]), 'deck.xlsx');
  const uploadResponse = await fetch(`${base}/api/profile/MasterCard/upload`, { method: 'POST', headers: { authorization: `Bearer ${aliceToken}` }, body: form });
  const upload = await uploadResponse.json();
  check('upload: one imported, one skipped', uploadResponse.status === 200 && upload.imported.length === 1 && upload.imported[0].cardCount === 1 && upload.skipped.length === 1, upload);

  const xls = new FormData();
  xls.append('file', new Blob(['x']), 'old.xls');
  const xlsResponse = await fetch(`${base}/api/profile/MasterCard/upload`, { method: 'POST', headers: { authorization: `Bearer ${aliceToken}` }, body: xls });
  check('.xls refused with 400', xlsResponse.status === 400, await xlsResponse.text());

  const profile = await call('GET', '/api/profile', aliceToken);
  check('profile', profile.status === 200 && profile.body.topSubCards.length === 1, profile);

  const badJson = await fetch(`${base}/api/folders`, { method: 'POST', headers: { 'content-type': 'application/json', authorization: `Bearer ${aliceToken}` }, body: '{bad' });
  check('bad JSON is 400', badJson.status === 400, badJson.status);
  const noneToken = 'eyJhbGciOiJub25lIn0.' + Buffer.from(JSON.stringify({ sub: 'x' })).toString('base64url') + '.';
  const none = await call('GET', '/api/profile', noneToken);
  check('alg=none token refused', none.status === 401, none);

  await AppDataSource.query(`UPDATE sub_cards SET title = 'changed' WHERE master_card_id IN (SELECT id FROM master_cards WHERE is_default) AND title = (SELECT min(title) FROM sub_cards)`);
  const synced = await syncTutorialDecks(AppDataSource);
  check('tutorial sync runs', synced >= 0, synced);

  const deleted = await call('DELETE', `/api/profile/MasterCard/${deckUuid}`, aliceToken);
  check('delete deck', deleted.status === 200, deleted);

  server.close();
  await AppDataSource.destroy();
  console.log(failures ? `${failures} FAILED` : 'ALL PASSED');
  process.exit(failures ? 1 : 0);
}
main().catch((error) => { console.error(error); process.exit(1); });
