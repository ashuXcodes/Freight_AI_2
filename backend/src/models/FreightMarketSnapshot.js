import mongoose from 'mongoose';

const freightMarketSnapshotSchema = new mongoose.Schema(
  {
    tradeLane: { type: mongoose.Schema.Types.ObjectId, ref: 'TradeLane', required: true },
    cargoType: { type: String, required: true, trim: true, maxlength: 100 },
    vesselType: { type: String, required: true, trim: true, maxlength: 100 },
    indicativeFreightRate: { type: Number, required: true, min: 0 },
    freightRateUnit: { type: String, enum: ['USD/MT'], required: true },
    marketDirection: { type: String, enum: ['RISING', 'STABLE', 'FALLING'], required: true },
    marketStrength: { type: String, enum: ['WEAK', 'MODERATE', 'STRONG'], required: true },
    demandSignal: { type: String, enum: ['SOFT', 'BALANCED', 'FIRM'], required: true },
    vesselSupplySignal: { type: String, enum: ['TIGHT', 'BALANCED', 'OPEN'], required: true },
    marketStatus: { type: String, enum: ['DEMO'], default: 'DEMO', required: true },
    commentary: { type: String, required: true, trim: true, maxlength: 500 },
    dataClassification: { type: String, enum: ['DEMO_PLACEHOLDER'], default: 'DEMO_PLACEHOLDER', required: true },
    dataDisclaimer: { type: String, required: true },
    isActive: { type: Boolean, default: true, required: true }
  },
  { timestamps: true }
);

freightMarketSnapshotSchema.index({ tradeLane: 1, cargoType: 1, vesselType: 1 }, { unique: true });

const FreightMarketSnapshot = mongoose.model('FreightMarketSnapshot', freightMarketSnapshotSchema);

export default FreightMarketSnapshot;
