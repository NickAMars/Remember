import 'reflect-metadata';
import { buildContainer } from './container';
import { createApp } from './app';
import { config, validateConfig } from './config';
import { AppDataSource } from './data-source';
import { syncTutorialDecks } from './services/tutorial';

async function main() {
  validateConfig();

  console.log('Connecting to database...');
  await AppDataSource.initialize();
  console.log('Database connected.');

  try {
    const updated = await syncTutorialDecks(AppDataSource);
    if (updated) console.log(`Updated ${updated} tutorial deck(s).`);
  } catch (error) {
    console.warn('Could not update tutorial decks:', error);
  }

  const container = buildContainer(AppDataSource);
  const app = createApp(container);

  const server = app.listen(config.port, () => {
    console.log(`Remember API on http://localhost:${config.port}`);
  });

  const shutdown = async () => {
    console.log('\nShutting down...');
    server.close();
    await AppDataSource.destroy();
    process.exit(0);
  };

  process.on('SIGTERM', shutdown);
  process.on('SIGINT', shutdown);
}

main().catch((error) => {
  console.error('Failed to start:', error);
  process.exit(1);
});
