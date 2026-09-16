import VesselType from '../models/VesselType.js';

export async function getVesselRecommendations(cargoQuantity) {
  const vesselTypes = await VesselType.find({
    maximumTypicalCargoCapacity: { $gte: cargoQuantity }
  }).lean();

  return rankVesselTypes(vesselTypes, cargoQuantity);
}

export function rankVesselTypes(vesselTypes, cargoQuantity) {
  return vesselTypes
    .filter((vesselType) => vesselType.maximumTypicalCargoCapacity >= cargoQuantity)
    .map((vesselType) => {
      const isWithinTypicalCapacityRange =
        cargoQuantity >= vesselType.minimumTypicalCargoCapacity &&
        cargoQuantity <= vesselType.maximumTypicalCargoCapacity;

      return {
        vesselType: vesselType.vesselType,
        minimumTypicalCargoCapacity: vesselType.minimumTypicalCargoCapacity,
        maximumTypicalCargoCapacity: vesselType.maximumTypicalCargoCapacity,
        typicalDraft: vesselType.typicalDraft,
        typicalLOA: vesselType.typicalLOA,
        typicalBeam: vesselType.typicalBeam,
        capacitySurplus: vesselType.maximumTypicalCargoCapacity - cargoQuantity,
        suitability: isWithinTypicalCapacityRange ? 'TYPICAL_CAPACITY_MATCH' : 'OVERSIZED_CAPACITY_MATCH',
        dataClassification: vesselType.dataClassification,
        dataDisclaimer: vesselType.dataDisclaimer
      };
    })
    .sort((first, second) => {
      const firstTypicalMatch = first.suitability === 'TYPICAL_CAPACITY_MATCH';
      const secondTypicalMatch = second.suitability === 'TYPICAL_CAPACITY_MATCH';

      if (firstTypicalMatch !== secondTypicalMatch) {
        return firstTypicalMatch ? -1 : 1;
      }

      return first.capacitySurplus - second.capacitySurplus;
    })
    .map((vesselType, index) => ({
      rank: index + 1,
      ...vesselType
    }));
}
