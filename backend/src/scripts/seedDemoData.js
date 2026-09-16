import { connectDatabase, disconnectDatabase } from '../config/database.js';
import { env } from '../config/env.js';
import { demoPorts } from '../data/demoPorts.js';
import { demoVesselTypes } from '../data/demoVesselTypes.js';
import { demoTradeLanes } from '../data/demoTradeLanes.js';
import { demoFreightMarketSnapshots } from '../data/demoFreightMarketSnapshots.js';
import { demoFreightForecasts } from '../data/demoFreightForecasts.js';
import Port from '../models/Port.js';
import VesselType from '../models/VesselType.js';
import { seedDemoTradeLanes } from '../services/tradeLaneService.js';
import { seedDemoFreightMarketSnapshots } from '../services/freightMarketService.js';
import { seedDemoFreightForecasts } from '../services/freightForecastService.js';

async function seedDemoData() {
  await connectDatabase(env.mongoUri);

  await Promise.all([
    VesselType.bulkWrite(
      demoVesselTypes.map((vesselType) => ({
        updateOne: {
          filter: { vesselType: vesselType.vesselType },
          update: { $set: vesselType },
          upsert: true
        }
      }))
    ),
    Port.bulkWrite(
      demoPorts.map((port) => ({
        updateOne: {
          filter: { portName: port.portName },
          update: { $set: port },
          upsert: true
        }
      }))
    )
  ]);

  await seedDemoTradeLanes(demoTradeLanes);
  await seedDemoFreightMarketSnapshots(demoFreightMarketSnapshots);
  await seedDemoFreightForecasts(demoFreightForecasts);

  console.log(
  `Seeded ${demoVesselTypes.length} demo vessel types, ` +
  `${demoPorts.length} demo placeholder ports, ` +
  `${demoTradeLanes.length} demo trade lanes, ` +
  `${demoFreightMarketSnapshots.length} demo market snapshots, ` +
  `and ${demoFreightForecasts.length} demo freight forecasts.`
);
}

seedDemoData()
  .catch((error) => {
    console.error('Unable to seed demo data:', error);
    process.exitCode = 1;
  })
  .finally(disconnectDatabase);
