import mongoose from "mongoose";

const freightForecastSchema = new mongoose.Schema(
  {
    forecastDate: {
      type: Date,
      required: true,
      index: true,
    },

    currentBdi: {
      type: Number,
      required: true,
    },

    forecastBdi: {
      type: Number,
      required: true,
    },

    forecastHorizonObservations: {
      type: Number,
      required: true,
      default: 7,
    },

    absoluteChange: {
      type: Number,
      required: true,
    },

    percentageChange: {
      type: Number,
      required: true,
    },

    direction: {
      type: String,
      enum: ["RISING", "FALLING", "STABLE"],
      required: true,
    },

    model: {
      type: String,
      required: true,
    },

    featureCount: {
      type: Number,
      required: true,
    },

    dataClassification: {
      type: String,
      required: true,
    },

    dataDisclaimer: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("FreightForecast", freightForecastSchema);