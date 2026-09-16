import { connectDatabase, disconnectDatabase } from '../config/database.js';
import { env } from '../config/env.js';
import { demoVesselTypes } from '../data/demoVesselTypes.js';
import VesselType from '../models/VesselType.js';

async function seedDemoVesselTypes() {
  await connectDatabase(env.mongoUri);

  await VesselType.bulkWrite(
    demoVesselTypes.map((vesselType) => ({
      updateOne: {
        filter: { vesselType: vesselType.vesselType },
        update: { $set: vesselType },
        upsert: true
      }
    }))
  );

  console.log(`Seeded ${demoVesselTypes.length} demo vessel types.`);
}

seedDemoVesselTypes()
  .catch((error) => {
    console.error('Unable to seed demo vessel types:', error);
    process.exitCode = 1;
  })
  .finally(disconnectDatabase);
