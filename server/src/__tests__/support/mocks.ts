/** Shared fakes for service unit tests. */

type Terminal = 'getMany' | 'getOne' | 'getCount' | 'getManyAndCount' | 'getRawMany' | 'getRawOne' | 'execute';

/**
 * A chainable TypeORM query builder. Every builder method (where, andWhere, select, ...)
 * returns the builder itself and is recorded as a jest mock; the terminal methods resolve
 * to the values passed in.
 */
export function makeQueryBuilder(results: Partial<Record<Terminal, unknown>> = {}) {
  const calls: Record<string, jest.Mock> = {};
  const builder: any = new Proxy(calls, {
    get(target, property: string) {
      if (!(property in target)) {
        if (property === 'then') return undefined; // not a promise
        target[property] = property in results || isTerminal(property)
          ? jest.fn().mockResolvedValue(results[property as Terminal] ?? defaultFor(property))
          : jest.fn(() => builder);
      }
      return target[property];
    },
  });
  return builder;
}

function isTerminal(name: string) {
  return ['getMany', 'getOne', 'getCount', 'getManyAndCount', 'getRawMany', 'getRawOne', 'execute'].includes(name);
}

function defaultFor(name: string) {
  if (name === 'getMany' || name === 'getRawMany') return [];
  if (name === 'getCount') return 0;
  if (name === 'getManyAndCount') return [[], 0];
  return null;
}

export function makeRepository() {
  return {
    findOneBy: jest.fn(),
    findOne: jest.fn(),
    find: jest.fn().mockResolvedValue([]),
    count: jest.fn().mockResolvedValue(0),
    countBy: jest.fn().mockResolvedValue(0),
    exists: jest.fn().mockResolvedValue(false),
    existsBy: jest.fn().mockResolvedValue(false),
    create: jest.fn((data: any) => ({ ...data })),
    save: jest.fn((entity: any) => Promise.resolve(entity)),
    remove: jest.fn(),
    delete: jest.fn(),
    update: jest.fn(),
    increment: jest.fn(),
    createQueryBuilder: jest.fn(() => makeQueryBuilder()),
  };
}

export type MockRepository = ReturnType<typeof makeRepository>;

/** A DataSource whose `transaction(work)` runs `work` with the given repositories, keyed by entity class name. */
export function makeDataSource(repositoriesByEntityName: Record<string, MockRepository>) {
  const manager = {
    getRepository: jest.fn((entity: { name: string }) => repositoriesByEntityName[entity.name]),
  };
  return {
    manager,
    getRepository: manager.getRepository,
    transaction: jest.fn((work: (transactionManager: typeof manager) => unknown) => work(manager)),
  };
}

/** Build a service without running its constructor, then plug in fakes. */
export function buildWith<Service>(serviceClass: { prototype: Service }, fields: Record<string, unknown>): Service {
  return Object.assign(Object.create(serviceClass.prototype as object), fields);
}
