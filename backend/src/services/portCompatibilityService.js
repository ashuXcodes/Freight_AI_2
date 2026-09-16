import Port from '../models/Port.js';
import VesselType from '../models/VesselType.js';

export class ResourceNotFoundError extends Error {
  constructor(resourceName, resourceValue) {
    super(`${resourceName} "${resourceValue}" was not found in the demo catalogue.`);
    this.name = 'ResourceNotFoundError';
  }
}

export async function getPortCompatibility({ originPortName, destinationPortName, vesselTypeName }) {
  const [originPort, destinationPort, vesselType] = await Promise.all([
    findPortByName(originPortName),
    findPortByName(destinationPortName),
    findVesselTypeByName(vesselTypeName)
  ]);

  if (!originPort) {
    throw new ResourceNotFoundError('Origin port', originPortName);
  }

  if (!destinationPort) {
    throw new ResourceNotFoundError('Destination port', destinationPortName);
  }

  if (!vesselType) {
    throw new ResourceNotFoundError('Vessel type', vesselTypeName);
  }

  return evaluateDestinationCompatibility({ originPort, destinationPort, vesselType });
}

export function evaluateDestinationCompatibility({ originPort, destinationPort, vesselType }) {
  const constraints = [
    {
      constraint: 'maximumDraft',
      vesselValue: vesselType.typicalDraft,
      portLimit: destinationPort.maximumDraft,
      unit: 'metres',
      reason: `Vessel typical draft (${vesselType.typicalDraft} m) exceeds the destination placeholder maximum draft (${destinationPort.maximumDraft} m).`
    },
    {
      constraint: 'maximumLOA',
      vesselValue: vesselType.typicalLOA,
      portLimit: destinationPort.maximumLOA,
      unit: 'metres',
      reason: `Vessel typical LOA (${vesselType.typicalLOA} m) exceeds the destination placeholder maximum LOA (${destinationPort.maximumLOA} m).`
    },
    {
      constraint: 'maximumBeam',
      vesselValue: vesselType.typicalBeam,
      portLimit: destinationPort.maximumBeam,
      unit: 'metres',
      reason: `Vessel typical beam (${vesselType.typicalBeam} m) exceeds the destination placeholder maximum beam (${destinationPort.maximumBeam} m).`
    }
  ];

  const failedConstraints = constraints
    .filter((constraint) => constraint.vesselValue > constraint.portLimit)
    .map(({ constraint, vesselValue, portLimit, unit }) => ({ constraint, vesselValue, portLimit, unit }));

  const compatible = failedConstraints.length === 0;

  return {
    originPort: { portName: originPort.portName, country: originPort.country },
    destinationPort: {
      portName: destinationPort.portName,
      country: destinationPort.country,
      maximumDraft: destinationPort.maximumDraft,
      maximumLOA: destinationPort.maximumLOA,
      maximumBeam: destinationPort.maximumBeam,
      cargoHandlingRate: destinationPort.cargoHandlingRate,
      cargoHandlingRateUnit: 'tonnes per day (placeholder)'
    },
    vesselType: {
      vesselType: vesselType.vesselType,
      typicalDraft: vesselType.typicalDraft,
      typicalLOA: vesselType.typicalLOA,
      typicalBeam: vesselType.typicalBeam
    },
    compatible,
    failedConstraints,
    reasons: compatible
      ? ['The vessel fits all destination DEMO/PLACEHOLDER draft, LOA, and beam limits.']
      : constraints.filter((constraint) => constraint.vesselValue > constraint.portLimit).map((constraint) => constraint.reason),
    originPortConstraintsEvaluated: false,
    dataClassification: 'DEMO_PLACEHOLDER',
    dataDisclaimer:
      'This result uses illustrative placeholder port limits and demo vessel values only. It is not operational port-clearance or chartering advice.'
  };
}

async function findPortByName(portName) {
  return Port.findOne({ portName: exactCaseInsensitiveMatch(portName) }).lean();
}

async function findVesselTypeByName(vesselTypeName) {
  return VesselType.findOne({ vesselType: exactCaseInsensitiveMatch(vesselTypeName) }).lean();
}

function exactCaseInsensitiveMatch(value) {
  const escapedValue = value.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return new RegExp(`^${escapedValue}$`, 'i');
}
