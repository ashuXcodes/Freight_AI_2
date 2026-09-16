import FreightForecast from "../models/FreightForecast.js";

export async function seedDemoFreightForecasts(demoForecasts) {
  for (const forecast of demoForecasts) {
    await FreightForecast.updateOne(
      {
        forecastDate: forecast.forecastDate,
      },
      {
        $set: forecast,
      },
      {
        upsert: true,
      }
    );
  }
}

export async function getCurrentFreightForecast() {
  const forecast = await FreightForecast.findOne()
    .sort({ forecastDate: -1 })
    .lean();

  if (!forecast) {
    return {
      isForecastAvailable: false,
      dataClassification: "DEMO / HISTORICAL-DATA MODEL",
      dataDisclaimer:
        "Forecast data is currently unavailable. " +
        "Voyage analysis can continue without forecasting intelligence.",
    };
  }

  return {
    isForecastAvailable: true,
    forecastDate: forecast.forecastDate,
    currentBdi: forecast.currentBdi,
    forecastBdi: forecast.forecastBdi,
    forecastHorizonObservations:
      forecast.forecastHorizonObservations,
    absoluteChange: forecast.absoluteChange,
    percentageChange: forecast.percentageChange,
    direction: forecast.direction,
    model: forecast.model,
    featureCount: forecast.featureCount,
    dataClassification:
      forecast.dataClassification,
    dataDisclaimer:
      forecast.dataDisclaimer,
  };
}