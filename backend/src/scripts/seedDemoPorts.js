import { connectDatabase, disconnectDatabase } from '../config/database.js';
import { env } from '../config/env.js';
import { demoPorts } from '../data/demoPorts.js';
import Port from '../models/Port.js';

async function seedDemoPorts() {
  await connectDatabase(env.mongoUri);

  await Port.bulkWrite(
    demoPorts.map((port) => ({
      updateOne: {
        filter: { portName: port.portName },
        update: { $set: port },
        upsert: true
      }
    }))
  );

  console.log(`Seeded ${demoPorts.length} demo placeholder ports.`);
}

seedDemoPorts()
  .catch((error) => {
    console.error('Unable to seed demo ports:', error);
    process.exitCode = 1;
  })
  .finally(disconnectDatabase);
