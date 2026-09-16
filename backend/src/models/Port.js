import mongoose from 'mongoose';

const portSchema = new mongoose.Schema(
  {
    portName: {
      type: String,
      required: true,
      trim: true,
      unique: true
    },
    country: {
      type: String,
      required: true,
      trim: true
    },
    maximumDraft: {
      type: Number,
      required: true,
      min: 0
    },
    maximumLOA: {
      type: Number,
      required: true,
      min: 0
    },
    maximumBeam: {
      type: Number,
      required: true,
      min: 0
    },
    cargoHandlingRate: {
      type: Number,
      required: true,
      min: 0
    },
    dataClassification: {
      type: String,
      enum: ['DEMO_PLACEHOLDER'],
      default: 'DEMO_PLACEHOLDER',
      required: true
    },
    dataDisclaimer: {
      type: String,
      required: true
    }
  },
  { timestamps: true }
);

const Port = mongoose.model('Port', portSchema);

export default Port;
