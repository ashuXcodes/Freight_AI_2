import {
  ResourceNotFoundError,
  getPortCompatibility
} from '../services/portCompatibilityService.js';
import Port from '../models/Port.js';

export async function listPorts(_request, response, next) {
  try {
    const ports = await Port.find({})
      .sort({ country: 1, portName: 1 })
      .select('portName country dataClassification dataDisclaimer')
      .lean();

    return response.status(200).json({
      ports: ports.map((port) => ({
        id: port._id.toString(),
        name: port.portName,
        country: port.country,
        dataClassification: port.dataClassification,
        dataDisclaimer: port.dataDisclaimer
      }))
    });
  } catch (error) {
    return next(error);
  }
}

export async function checkPortCompatibility(request, response, next) {
  const { originPort, destinationPort, vesselType } = request.body ?? {};
  const invalidFields = [
    ['originPort', originPort],
    ['destinationPort', destinationPort],
    ['vesselType', vesselType]
  ]
    .filter(([, value]) => typeof value !== 'string' || value.trim().length === 0)
    .map(([field]) => field);

  if (invalidFields.length > 0) {
    return response.status(400).json({
      error: 'originPort, destinationPort, and vesselType must be non-empty strings.',
      invalidFields,
      example: {
        originPort: 'Paradip',
        destinationPort: 'Haldia',
        vesselType: 'Handysize'
      }
    });
  }

  try {
    const compatibility = await getPortCompatibility({
      originPortName: originPort.trim(),
      destinationPortName: destinationPort.trim(),
      vesselTypeName: vesselType.trim()
    });

    return response.status(200).json(compatibility);
  } catch (error) {
    if (error instanceof ResourceNotFoundError) {
      return response.status(404).json({ error: error.message });
    }

    return next(error);
  }
}
