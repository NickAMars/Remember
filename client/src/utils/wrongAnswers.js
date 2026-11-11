/** Most wrong answers one card can keep. Matches MAX_WRONG_ANSWERS on the server. */
export const MAX_WRONG_ANSWERS = 10;
const MAX_ANSWER_LENGTH = 5000;

/**
 * Clean a list of wrong answers: trim each one, drop blanks, drop repeats (ignoring case),
 * drop any that equal the right answer, and keep at most MAX_WRONG_ANSWERS.
 */
export function cleanWrongAnswers(wrongAnswers, rightAnswer = '') {
  if (!Array.isArray(wrongAnswers)) return [];
  const seenAnswers = new Set([String(rightAnswer ?? '').trim().toLowerCase()]);
  const cleaned = [];
  for (const rawAnswer of wrongAnswers) {
    const answerText = String(rawAnswer ?? '').trim().slice(0, MAX_ANSWER_LENGTH);
    const lowered = answerText.toLowerCase();
    if (!answerText || seenAnswers.has(lowered)) continue;
    seenAnswers.add(lowered);
    cleaned.push(answerText);
    if (cleaned.length >= MAX_WRONG_ANSWERS) break;
  }
  return cleaned;
}
