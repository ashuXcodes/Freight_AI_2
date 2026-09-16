import { findTradeLane, listTradeLanes, TradeLaneNotFoundError } from '../services/tradeLaneService.js';

export async function listAvailableTradeLanes(_request, response, next) {
  try {
    return response.status(200).json({ tradeLanes: await listTradeLanes() });
  } catch (error) {
    return next(error);
  }
}

export async function lookupTradeLane(request, response, next) {
  const { originPort, destinationPort } = request.query;
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
    return response.status(200).json({ tradeLane: await findTradeLane(originPort.trim(), destinationPort.trim()) });
  } catch (error) {
    if (error instanceof TradeLaneNotFoundError) return response.status(404).json({ error: error.message });
    return next(error);
  }
}
