import { createApp } from './app';
import { connectDatabase } from './config/database';
import { env } from './config/env';
import { logger } from './utils/logger';
import { ensureAdminAccount } from './services/auth.service';

async function bootstrap() {
  await connectDatabase();
  await ensureAdminAccount();
  logger.info('Admin account ready: rimon@ticketbus.com / 2002');
  const app = createApp();
  app.listen(env.port, () => {
    logger.info(`Server listening on http://localhost:${env.port}`);
  });
}

bootstrap().catch((err) => {
  logger.error('Failed to start server', err);
  process.exit(1);
});
