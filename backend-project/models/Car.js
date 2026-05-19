import mongoose from 'mongoose';

const carSchema = new mongoose.Schema(
  {
    plateNumber: {
      type: String,
      required: [true, 'Plate number is required'],
      unique: true,
      trim: true,
      uppercase: true,
    },
    type: {
      type: String,
      required: [true, 'Car type is required'],
    },
    model: {
      type: String,
      required: [true, 'Car model is required'],
    },
    manufacturingYear: {
      type: Number,
      required: [true, 'Manufacturing year is required'],
      min: [1900, 'Year must be valid'],
      max: [new Date().getFullYear(), 'Year cannot be in the future'],
    },
    driverPhone: {
      type: String,
      required: [true, 'Driver phone is required'],
      match: [/^\d{10}$/, 'Phone number must be 10 digits'],
    },
    mechanicName: {
      type: String,
      required: [true, 'Mechanic name is required'],
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

export default mongoose.model('Car', carSchema);
