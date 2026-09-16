import Port from '../models/Port.js';
import TradeLane from '../models/TradeLane.js';

export class TradeLaneNotFoundError extends Error {
  constructor(message) {
    super(message);
    this.name = 'TradeLaneNotFoundError';
  }
}

export async function seedDemoTradeLanes(demoTradeLanes) {
  const portNames = [...new Set(demoTradeLanes.flatMap((lane) => [lane.originPortName, lane.destinationPortName]))];
  const ports = await Port.find({ portName: { $in: portNames } }).select('portName').lean();
  const portIds = new Map(ports.map((port) => [port.portName, port._id]));

  if (portIds.size !== portNames.length) {
    throw new Error('Demo trade lanes reference a port that is missing from the catalogue.');
  }

  await TradeLane.bulkWrite(demoTradeLanes.map(({ originPortName, destinationPortName, ...lane }) => ({
    updateOne: {
      filter: { originPort: portIds.get(originPortName), destinationPort: portIds.get(destinationPortName) },
      update: { $set: { ...lane, originPort: portIds.get(originPortName), destinationPort: portIds.get(destinationPortName) } },
      upsert: true
    }
  })));
}

export async function listTradeLanes() {
  const lanes = await TradeLane.find({ isActive: true })
    .populate('originPort', 'portName country')
    .populate('destinationPort', 'portName country')
    .sort({ laneName: 1 })
    .lean();
  return lanes.map(toSafeLane);
}

export async function findTradeLane(originPortName, destinationPortName) {
  const [originPort, destinationPort] = await Promise.all([findPortByName(originPortName), findPortByName(destinationPortName)]);

  if (!originPort) throw new TradeLaneNotFoundError(`Origin port "${originPortName}" was not found in the demo catalogue.`);
  if (!destinationPort) throw new TradeLaneNotFoundError(`Destination port "${destinationPortName}" was not found in the demo catalogue.`);

  const lane = await TradeLane.findOne({ originPort: originPort._id, destinationPort: destinationPort._id, isActive: true })
    .populate('originPort', 'portName country')
    .populate('destinationPort', 'portName country')
    .lean();

  if (!lane) return toFallbackRouteProfile(originPort, destinationPort);
  return toSafeLane(lane);
}

function toFallbackRouteProfile(originPort, destinationPort) {
  const tradeDirection = originPort.country === destinationPort.country ? 'Domestic' : 'International';

  return {
    id: null,
    origin: { name: originPort.portName, country: originPort.country },
    destination: { name: destinationPort.portName, country: destinationPort.country },
    laneName: `${originPort.portName} → ${destinationPort.portName}`,
    routeProfile: {
      originCountry: originPort.country,
      destinationCountry: destinationPort.country,
      tradeDirection
    },
    isDetailedLaneDataAvailable: false,
    dataClassification: 'DEMO_ESTIMATED',
    dataDisclaimer:
      'Detailed trade-lane data is not currently available for this route. This route profile is derived from the selected port catalogue and is for demonstration only.'
  };
}

function toSafeLane(lane) {
  return {
    id: lane._id.toString(),
    origin: { name: lane.originPort.portName, country: lane.originPort.country },
    destination: { name: lane.destinationPort.portName, country: lane.destinationPort.country },
    laneName: lane.laneName,
    distanceNm: lane.distanceNm,
    estimatedTransitDays: lane.estimatedTransitDays,
    cargoTypes: lane.cargoTypes,
    preferredVesselTypes: lane.preferredVesselTypes,
    dataClassification: lane.dataClassification,
    dataDisclaimer: lane.dataDisclaimer
  };
}

async function findPortByName(portName) {
  const escapedValue = portName.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return Port.findOne({ portName: new RegExp(`^${escapedValue}$`, 'i') }).select('portName country').lean();
}
