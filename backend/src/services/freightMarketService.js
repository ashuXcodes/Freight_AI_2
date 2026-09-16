import FreightMarketSnapshot from '../models/FreightMarketSnapshot.js';
import TradeLane from '../models/TradeLane.js';
import { findTradeLane } from './tradeLaneService.js';

export async function seedDemoFreightMarketSnapshots(demoSnapshots) {
  const lanes = await TradeLane.find({ isActive: true })
    .populate('originPort', 'portName')
    .populate('destinationPort', 'portName')
    .lean();
  const laneIds = new Map(lanes.map((lane) => [`${lane.originPort.portName}|${lane.destinationPort.portName}`, lane._id]));

  if (demoSnapshots.some((snapshot) => !laneIds.has(`${snapshot.originPortName}|${snapshot.destinationPortName}`))) {
    throw new Error('Demo freight market snapshots reference a trade lane that is missing from the catalogue.');
  }

  await FreightMarketSnapshot.bulkWrite(demoSnapshots.map(({ originPortName, destinationPortName, ...snapshot }) => ({
    updateOne: {
      filter: { tradeLane: laneIds.get(`${originPortName}|${destinationPortName}`), cargoType: snapshot.cargoType, vesselType: snapshot.vesselType },
      update: { $set: { ...snapshot, tradeLane: laneIds.get(`${originPortName}|${destinationPortName}`) } },
      upsert: true
    }
  })));
}

export async function getFreightMarketIntelligence(originPortName, destinationPortName, vesselType) {
  const tradeLane = await findTradeLane(originPortName, destinationPortName);

  if (!tradeLane.id) return unavailableMarket(tradeLane);

  const snapshotQuery = { tradeLane: tradeLane.id, isActive: true };
  if (vesselType) snapshotQuery.vesselType = new RegExp(`^${escapeRegExp(vesselType)}$`, 'i');
  const snapshot = await FreightMarketSnapshot.findOne(snapshotQuery).lean();
  if (!snapshot) return unavailableMarket(tradeLane);

  return {
    isMarketDataAvailable: true,
    tradeLane: { name: `${tradeLane.origin.name} → ${tradeLane.destination.name}` },
    cargoType: snapshot.cargoType,
    vesselType: snapshot.vesselType,
    indicativeFreightRate: snapshot.indicativeFreightRate,
    freightRateUnit: snapshot.freightRateUnit,
    marketDirection: snapshot.marketDirection,
    marketStrength: snapshot.marketStrength,
    demandSignal: snapshot.demandSignal,
    vesselSupplySignal: snapshot.vesselSupplySignal,
    marketStatus: snapshot.marketStatus,
    commentary: snapshot.commentary,
    dataClassification: snapshot.dataClassification,
    dataDisclaimer: snapshot.dataDisclaimer
  };
}

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function unavailableMarket(tradeLane) {
  return {
    isMarketDataAvailable: false,
    tradeLane: { name: `${tradeLane.origin.name} → ${tradeLane.destination.name}` },
    dataClassification: 'DEMO_ESTIMATED',
    dataDisclaimer: 'Market data is not currently available for this route. Voyage analysis can continue using the available trade-lane, vessel, and port information.'
  };
}
