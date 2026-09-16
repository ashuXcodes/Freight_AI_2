import app from './app.js';
import { connectDatabase } from './config/database.js';
import { env } from './config/env.js';



async function startServer() {
  await connectDatabase(env.mongoUri);

  app.listen(env.port, () => {
    console.log(`FreightAI API is running on http://localhost:${env.port} (${env.nodeEnv})`);
  });
}

startServer().catch((error) => {
  console.error('Unable to start FreightAI API:', error);
  process.exit(1);
});
