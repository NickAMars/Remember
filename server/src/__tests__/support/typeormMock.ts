/**
 * A stand-in for the `typeorm` package in unit tests, so entities load without a database.
 * Use it with: jest.mock('typeorm', () => require('./support/typeormMock'));
 *
 * Every decorator (Entity, Column, Index, ...) becomes a no-op. Find operators return their
 * argument so tests can check what was passed.
 */
const noopDecorator = () => () => undefined;

const knownExports: Record<string, unknown> = {
  __esModule: true,
  In: (values: unknown) => values,
  LessThanOrEqual: (value: unknown) => value,
  MoreThan: (value: unknown) => value,
  IsNull: () => null,
  DataSource: class {},
  Repository: class {},
};

module.exports = new Proxy(knownExports, {
  get(target, property: string) {
    if (property in target) return target[property];
    if (typeof property === 'string' && /^[A-Z]/.test(property)) return noopDecorator;
    return undefined;
  },
});
