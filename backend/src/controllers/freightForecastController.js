import { getCurrentFreightForecast } from "../services/freightForecastService.js";

export async function getCurrentForecast(req, res) {
  try {
    const forecast = await getCurrentFreightForecast();

    return res.status(200).json({
      forecast,
    });
  } catch (error) {
    console.error(
      "Failed to load current freight forecast:",
      error
    );

    return res.status(500).json({
      message: "Failed to load freight forecast",
    });
  }
}