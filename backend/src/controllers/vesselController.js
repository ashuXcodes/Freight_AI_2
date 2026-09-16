import { getVesselRecommendations } from '../services/vesselRecommendationService.js';
import VesselType from '../models/VesselType.js';

export async function listVesselTypes(_request, response, next) {
  try {
    const vessels = await VesselType.find({})
      .sort({ vesselType: 1 })
      .select('vesselType dataClassification dataDisclaimer')
      .lean();

    return response.status(200).json({
      vessels: vessels.map((vessel) => ({
        id: vessel._id.toString(),
        vesselType: vessel.vesselType,
        dataClassification: vessel.dataClassification,
        dataDisclaimer: vessel.dataDisclaimer
      }))
    });
  } catch (error) {
    return next(error);
  }
}

export async function recommendVessels(request, response, next) {
  const { cargoQuantity } = request.body ?? {};

  if (typeof cargoQuantity !== 'number' || !Number.isFinite(cargoQuantity) || cargoQuantity <= 0) {
    return response.status(400).json({
      error: 'cargoQuantity must be a positive number.',
      example: { cargoQuantity: 80000 }
    });
  }

  try {
    const recommendations = await getVesselRecommendations(cargoQuantity);

    return response.status(200).json({
      cargoQuantity,
      unit: 'tonnes (demo assumption)',
      dataClassification: 'DEMO_SAMPLE',
      dataDisclaimer:
        'Recommendations are calculated from illustrative demo data only and are not operational chartering advice.',
      recommendationCount: recommendations.length,
      recommendations
    });
  } catch (error) {
    return next(error);
  }
}
