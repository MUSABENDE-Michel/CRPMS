import mongoose from 'mongoose';

const serviceSchema = new mongoose.Schema(
  {
    serviceCode: {
      type: String,
      required: [true, 'Service code is required'],
      unique: true,
      trim: true,
      uppercase: true,
    },
    serviceName: {
      type: String,
      required: [true, 'Service name is required'],
    },
    servicePrice: {
      type: Number,
      required: [true, 'Service price is required'],
      min: [0, 'Price must be positive'],
    },
    serviceDescription: {
      type: String,
      required: false,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Admin',
      required: true,
    },
    status: {
      type: String,
      default: 'Active',
      enum: ['Active', 'Inactive'],
    },
  },
  { timestamps: true }
);

export default mongoose.model('Service', serviceSchema);
