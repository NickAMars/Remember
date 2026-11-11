// ── Auth ────────────────────────────────────────────────────────────────
export const BCRYPT_SALT_ROUNDS = 12;
export const LOGIN_RATE_LIMIT_WINDOW_MS = 15 * 60_000;
export const MAX_LOGIN_ATTEMPTS = 10;
export const MAX_SIGNUPS_PER_WINDOW = 5;
/** JWTs are always signed and verified with this one algorithm (blocks "alg" swapping). */
export const JWT_ALGORITHM = 'HS256' as const;

// ── Request limits ──────────────────────────────────────────────────────
/** Big enough for a deck of ~2,000 long SAA-style questions sent as JSON. */
export const JSON_BODY_LIMIT = '2mb';
export const MAX_UPLOAD_BYTES = 5 * 1024 * 1024;
export const API_RATE_LIMIT_WINDOW_MS = 60_000;
export const MAX_API_REQUESTS_PER_WINDOW = 600;

// ── Card field limits (match the database column sizes) ─────────────────
export const MAX_DECK_TITLE_LENGTH = 128;
export const MAX_QUESTION_LENGTH = 1000;
export const MAX_ANSWER_LENGTH = 5000;
export const MAX_LINK_LENGTH = 2000;
export const MAX_FOLDER_NAME_LENGTH = 255;
export const MAX_CARDS_PER_REQUEST = 5000;
export const MAX_SEARCH_LENGTH = 200;

// ── Pagination ──────────────────────────────────────────────────────────
export const DEFAULT_PAGE_SIZE = 10;
export const MAX_PAGE_SIZE = 100;

// ── Study progress ──────────────────────────────────────────────────────
export const MAX_PROGRESS_DAYS = 8;
export const TOP_FIVE_LIMIT = 5;
export const MILLISECONDS_PER_DAY = 86_400_000;
/** One study session can add at most 12 hours, so a forgotten open tab can't skew the stats. */
export const MAX_STUDY_SESSION_MS = 12 * 60 * 60 * 1000;

// ── Sharing ─────────────────────────────────────────────────────────────
export const MAX_PUBLIC_DECKS_PER_USER = 5;

// ── Database ────────────────────────────────────────────────────────────
/** perf Increase: insert large decks in batches instead of one huge statement. */
export const DATABASE_INSERT_CHUNK_SIZE = 500;

// ── Quiz and review ─────────────────────────────────────────────────────
export const QUIZ_CHOICES = 4;
export const MAX_QUIZ_QUESTIONS = 1000;
/** perf Increase: wrong answers are drawn from a random sample of this size, not every card. */
export const QUIZ_ANSWER_POOL_SIZE = 2000;
export const MAX_REVIEW_RESULTS_PER_REQUEST = 2000;
