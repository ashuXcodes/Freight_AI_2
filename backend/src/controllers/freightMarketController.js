import { TradeLaneNotFoundError } from '../services/tradeLaneService.js';
import { getFreightMarketIntelligence } from '../services/freightMarketService.js';

export async function lookupFreightMarket(request, response, next) {
  const { originPort, destinationPort, vesselType } = request.query;
  const invalidFields = [['originPort', originPort], ['destinationPort', destinationPort]]
    .filter(([, value]) => typeof value !== 'string' || value.trim().length === 0)
    .map(([field]) => field);

  if (invalidFields.length > 0) {
    return response.status(400).json({ error: 'originPort and destinationPort must be non-empty strings.', invalidFields });
  }
  if (originPort.trim().toLowerCase() === destinationPort.trim().toLowerCase()) {
    return response.status(400).json({ error: 'originPort and destinationPort must be different.', invalidFields: ['destinationPort'] });
  }

  try {
    return response.status(200).json({
      market: await getFreightMarketIntelligence(
        originPort.trim(),
        destinationPort.trim(),
        typeof vesselType === 'string' && vesselType.trim() ? vesselType.trim() : undefined
      )
    });
  } catch (error) {
    if (error instanceof TradeLaneNotFoundError) return response.status(404).json({ error: error.message });
    return next(error);
  }
}
