import app from './app';
import { connectDatabase } from './config/database';
import { env } from './config/env';

async function bootstrap() {
  await connectDatabase();

  app.listen(env.PORT, '0.0.0.0', () => {
    console.log(`Server listening on port ${env.PORT}`);
  });
}

bootstrap().catch((error) => {
  console.error('Failed to start server', error);
  process.exit(1);
});
