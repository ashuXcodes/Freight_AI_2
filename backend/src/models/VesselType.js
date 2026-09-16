import mongoose from 'mongoose';

const vesselTypeSchema = new mongoose.Schema(
  {
    vesselType: {
      type: String,
      required: true,
      trim: true,
      unique: true
    },
    minimumTypicalCargoCapacity: {
      type: Number,
      required: true,
      min: 0
    },
    maximumTypicalCargoCapacity: {
      type: Number,
      required: true,
      min: 0,
      validate: {
        validator(value) {
          return value >= this.minimumTypicalCargoCapacity;
        },
        message: 'maximumTypicalCargoCapacity must be greater than or equal to minimumTypicalCargoCapacity.'
      }
    },
    typicalDraft: {
      type: Number,
      required: true,
      min: 0
    },
    typicalLOA: {
      type: Number,
      required: true,
      min: 0
    },
    typicalBeam: {
      type: Number,
      required: true,
      min: 0
    },
    dataClassification: {
      type: String,
      enum: ['DEMO_SAMPLE'],
      default: 'DEMO_SAMPLE',
      required: true
    },
    dataDisclaimer: {
      type: String,
      required: true
    }
  },
  { timestamps: true }
);

const VesselType = mongoose.model('VesselType', vesselTypeSchema);

export default VesselType;
