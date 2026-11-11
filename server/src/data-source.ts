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
  synchronize: false,
  migrations: [join(__dirname, 'migrations', '*{.ts,.js}')],
  migrationsRun: true,
  logging: ['error', 'warn', 'migration'],
  ssl: config.databaseSsl ? { rejectUnauthorized: true } : false,
  extra: {
    max: config.databasePoolMax,
    // No idle connections are kept, so a free database that sleeps when unused (like Neon) can sleep.
    min: 0,
    idleTimeoutMillis: 30_000,
    connectionTimeoutMillis: 5_000,
  },
});
