const demoDisclaimer =
  'Demo/placeholder trade-lane values only. Distances and transit estimates are illustrative catalogue data, not operational voyage guidance.';

export const demoTradeLanes = [
  { originPortName: 'Paradip', destinationPortName: 'Haldia', laneName: 'India → India', distanceNm: 250, estimatedTransitDays: 1, cargoTypes: ['Thermal coal', 'Iron ore'], preferredVesselTypes: ['Handysize', 'Handymax'] },
  { originPortName: 'Paradip', destinationPortName: 'Newcastle', laneName: 'India → Australia', distanceNm: 5400, estimatedTransitDays: 16, cargoTypes: ['Thermal coal', 'Iron ore'], preferredVesselTypes: ['Panamax', 'Kamsarmax'] },
  { originPortName: 'Paradip', destinationPortName: 'Tanjung Priok', laneName: 'India → Indonesia', distanceNm: 2700, estimatedTransitDays: 8, cargoTypes: ['Thermal coal', 'Fertiliser'], preferredVesselTypes: ['Handymax', 'Supramax', 'Panamax'] },
  { originPortName: 'Paradip', destinationPortName: 'Maputo', laneName: 'India → Mozambique', distanceNm: 3600, estimatedTransitDays: 11, cargoTypes: ['Coal', 'Limestone'], preferredVesselTypes: ['Supramax', 'Panamax'] },
  { originPortName: 'Paradip', destinationPortName: 'Houston', laneName: 'India → United States', distanceNm: 10500, estimatedTransitDays: 31, cargoTypes: ['Iron ore', 'Steel products'], preferredVesselTypes: ['Panamax', 'Kamsarmax'] },
  { originPortName: 'Newcastle', destinationPortName: 'Paradip', laneName: 'Australia → India', distanceNm: 5400, estimatedTransitDays: 16, cargoTypes: ['Thermal coal', 'Metallurgical coal'], preferredVesselTypes: ['Panamax', 'Kamsarmax'] },
  { originPortName: 'Port Hedland', destinationPortName: 'Paradip', laneName: 'Australia → India', distanceNm: 5000, estimatedTransitDays: 15, cargoTypes: ['Iron ore'], preferredVesselTypes: ['Panamax', 'Kamsarmax', 'Capesize'] },
  { originPortName: 'Tanjung Priok', destinationPortName: 'Paradip', laneName: 'Indonesia → India', distanceNm: 2700, estimatedTransitDays: 8, cargoTypes: ['Coal', 'Palm-kernel expeller'], preferredVesselTypes: ['Handysize', 'Handymax', 'Supramax'] },
  { originPortName: 'Maputo', destinationPortName: 'Paradip', laneName: 'Mozambique → India', distanceNm: 3600, estimatedTransitDays: 11, cargoTypes: ['Coal', 'Chromite'], preferredVesselTypes: ['Supramax', 'Panamax'] },
  { originPortName: 'Houston', destinationPortName: 'Paradip', laneName: 'United States → India', distanceNm: 10500, estimatedTransitDays: 31, cargoTypes: ['Petroleum coke', 'Steel products'], preferredVesselTypes: ['Panamax', 'Kamsarmax'] }
].map((lane) => ({ ...lane, isActive: true, dataClassification: 'DEMO_PLACEHOLDER', dataDisclaimer: demoDisclaimer }));
