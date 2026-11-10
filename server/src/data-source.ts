import 'reflect-metadata';
import { join } from 'node:path';
import { DataSource } from 'typeorm';
import { SnakeNamingStrategy } from 'typeorm-naming-strategies';
import { config } from './config';
import { entities } from './entities';

export const AppDataSource = new DataSource({
  type: 'postgres',
  url: config.databaseUrl,
  entities,
  namingStrategy: new SnakeNamingStrategy(),
  synchronize: config.dbSync,
  migrations: [join(__dirname, 'migrations', '*{.ts,.js}')],
  migrationsRun: config.production,
  logging: ['error', 'warn', 'migration'],
  extra: {
    max: 10,
    min: 2,
    idleTimeoutMillis: 30_000,
    connectionTimeoutMillis: 5_000,
  },
});
