import { escapeLikePattern, normalizeLink, paginationQuery, resolvePagination, UUID_REGEX, linkField } from '../utils/validation';
import { usernameField } from '../controllers/AuthController';

jest.mock('inversify', () => ({
  injectable: () => (target: Function) => target,
  inject: () => () => undefined,
}));
jest.mock('typeorm', () => require('./support/typeormMock'));
jest.mock('../config', () => ({ config: { jwtSecret: 'test-secret', jwtTtl: '1h' } }));

describe('normalizeLink', () => {
  it('keeps http and https links', () => {
    expect(normalizeLink('https://aws.amazon.com/s3/')).toBe('https://aws.amazon.com/s3/');
    expect(normalizeLink('http://example.com')).toBe('http://example.com/');
  });

  it('adds https:// to a bare domain', () => {
    expect(normalizeLink('docs.aws.amazon.com/ec2')).toBe('https://docs.aws.amazon.com/ec2');
  });

  it('blocks links that would run code', () => {
    expect(normalizeLink('javascript:alert(1)')).toBe('');
    expect(normalizeLink('JaVaScRiPt:alert(1)')).toBe('');
    expect(normalizeLink('data:text/html,<script>alert(1)</script>')).toBe('');
    expect(normalizeLink('vbscript:msgbox(1)')).toBe('');
  });

  it('treats words that are not links as empty', () => {
    expect(normalizeLink('N/A')).toBe('');
    expect(normalizeLink('none')).toBe('');
    expect(normalizeLink('')).toBe('');
    expect(normalizeLink(undefined)).toBe('');
    expect(normalizeLink(null)).toBe('');
  });

  it('is used by the zod link field', () => {
    expect(linkField.parse('javascript:alert(1)')).toBe('');
    expect(linkField.parse(undefined)).toBe('');
  });
});

describe('escapeLikePattern', () => {
  it('escapes LIKE wildcards so they match literally', () => {
    expect(escapeLikePattern('100%')).toBe('100\\%');
    expect(escapeLikePattern('a_b')).toBe('a\\_b');
    expect(escapeLikePattern('back\\slash')).toBe('back\\\\slash');
    expect(escapeLikePattern('plain')).toBe('plain');
  });
});

describe('paginationQuery and resolvePagination', () => {
  it('reads numbers from query strings', () => {
    expect(paginationQuery.parse({ page: '2', pageSize: '20', search: ' ec2 ' })).toEqual({ page: 2, pageSize: 20, search: 'ec2' });
  });

  it('rejects a page size over the maximum', () => {
    expect(() => paginationQuery.parse({ pageSize: '100000' })).toThrow();
  });

  it('rejects negative and non-numeric pages', () => {
    expect(() => paginationQuery.parse({ page: '-1' })).toThrow();
    expect(() => paginationQuery.parse({ page: 'abc' })).toThrow();
  });

  it('fills in a default page size when only the page is given', () => {
    expect(resolvePagination({ page: 1 })).toEqual({ page: 1, pageSize: 10, search: undefined });
  });

  it('leaves paging off when neither is given', () => {
    expect(resolvePagination({ search: 'x' })).toEqual({ search: 'x' });
  });
});

describe('UUID_REGEX', () => {
  it('matches uuids only', () => {
    expect(UUID_REGEX.test('0b0f3a8e-1b2c-4d5e-8f90-123456789abc')).toBe(true);
    expect(UUID_REGEX.test('not-a-uuid')).toBe(false);
    expect(UUID_REGEX.test("0b0f3a8e-1b2c-4d5e-8f90-123456789abc' OR 1=1")).toBe(false);
  });
});

describe('usernameField', () => {
  it('accepts normal names and trims spaces', () => {
    expect(usernameField.parse('  marsden_01 ')).toBe('marsden_01');
  });

  it('rejects names that are too short, too long or have odd characters', () => {
    expect(() => usernameField.parse('ab')).toThrow();
    expect(() => usernameField.parse('a'.repeat(33))).toThrow();
    expect(() => usernameField.parse('<script>')).toThrow();
    expect(() => usernameField.parse('with space')).toThrow();
  });
});
