import mongoose from 'mongoose';

const tradeLaneSchema = new mongoose.Schema(
  {
    originPort: { type: mongoose.Schema.Types.ObjectId, ref: 'Port', required: true },
    destinationPort: { type: mongoose.Schema.Types.ObjectId, ref: 'Port', required: true },
    laneName: { type: String, required: true, trim: true, maxlength: 200 },
    distanceNm: { type: Number, required: true, min: 1 },
    estimatedTransitDays: { type: Number, required: true, min: 0.1 },
    cargoTypes: [{ type: String, trim: true, maxlength: 100 }],
    preferredVesselTypes: [{ type: String, trim: true, maxlength: 100 }],
    isActive: { type: Boolean, default: true, required: true },
    dataClassification: { type: String, enum: ['DEMO_PLACEHOLDER'], default: 'DEMO_PLACEHOLDER', required: true },
    dataDisclaimer: { type: String, required: true }
  },
  { timestamps: true }
);

tradeLaneSchema.index({ originPort: 1, destinationPort: 1 }, { unique: true });
tradeLaneSchema.path('destinationPort').validate(function destinationDiffersFromOrigin(value) {
  return !this.originPort || !value || !this.originPort.equals(value);
}, 'originPort and destinationPort must be different.');

const TradeLane = mongoose.model('TradeLane', tradeLaneSchema);

export default TradeLane;
