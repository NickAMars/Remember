import { z } from 'zod';
import {
  DEFAULT_PAGE_SIZE,
  MAX_ANSWER_LENGTH,
  MAX_LINK_LENGTH,
  MAX_PAGE_SIZE,
  MAX_QUESTION_LENGTH,
  MAX_SEARCH_LENGTH,
} from '../constants';

/** Route pattern for a v4-style uuid, used in Express paths like `/:uuid(${UUID_ROUTE_PATTERN})`. */
export const UUID_ROUTE_PATTERN = '[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}';
export const UUID_REGEX = new RegExp(`^${UUID_ROUTE_PATTERN}$`);

/**
 * Turn any user supplied link into a safe http(s) link, or '' when it is not one.
 * Security: this blocks `javascript:` and `data:` links, which would run code when clicked.
 */
export function normalizeLink(rawLink: unknown): string {
  const text = String(rawLink ?? '').trim();
  if (!text) return '';
  const hasProtocol = /^[a-z][a-z0-9+.-]*:/i.test(text);
  try {
    const url = new URL(hasProtocol ? text : `https://${text}`);
    if (url.protocol !== 'http:' && url.protocol !== 'https:') return '';
    // A bare word like "N/A" is not a link.
    if (!hasProtocol && !url.hostname.includes('.')) return '';
    return url.toString().slice(0, MAX_LINK_LENGTH);
  } catch {
    return '';
  }
}

/** Escape `%`, `_` and `\` so a search term is matched literally inside SQL LIKE. */
export function escapeLikePattern(searchTerm: string): string {
  return searchTerm.replace(/[\\%_]/g, (character) => `\\${character}`);
}

/** Reusable zod field for an optional reference link. Unsafe links become ''. */
export const linkField = z.string().max(MAX_LINK_LENGTH).optional().default('').transform(normalizeLink);

export const questionField = z.string().trim().min(1).max(MAX_QUESTION_LENGTH);
export const answerField = z.string().max(MAX_ANSWER_LENGTH).optional().default('');

/** `?page=0&pageSize=10&search=abc`. Page size is capped so one request can't pull the whole table. */
export const paginationQuery = z.object({
  page: z.coerce.number().int().min(0).max(100_000).optional(),
  pageSize: z.coerce.number().int().min(1).max(MAX_PAGE_SIZE).optional(),
  search: z.string().trim().max(MAX_SEARCH_LENGTH).optional(),
});

export interface Pagination {
  page?: number;
  pageSize?: number;
  search?: string;
}

/** Fill in a default page size when only `page` is given. */
export function resolvePagination(query: Pagination): Pagination {
  const search = query.search ? query.search : undefined;
  if (query.page === undefined && query.pageSize === undefined) return { search };
  return { page: query.page ?? 0, pageSize: query.pageSize ?? DEFAULT_PAGE_SIZE, search };
}
