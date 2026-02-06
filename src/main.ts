import { loadConfig } from './config';
import { createContainer } from './application/container';

async function main(): Promise<void> {
  const configResult = loadConfig();

  if (configResult.isErr()) {
    console.error('Configuration error:', configResult.error);
    process.exit(1);
  }

  const container = createContainer(configResult.value);
  await container.initialize();

  container.app.listen(container.config.port, () => {
    container.logger.info(
      { port: container.config.port },
      'Mock CDN server running',
    );
  });
}

main().catch((err) => {
  console.error('Fatal error:', err);
  process.exit(1);
});
