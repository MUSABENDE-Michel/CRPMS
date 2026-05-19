import mongoose from 'mongoose';

const serviceRecordSchema = new mongoose.Schema(
  {
    serviceDate: {
      type: Date,
      required: [true, 'Service date is required'],
    },
    plateNumber: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Car',
      required: true,
    },
    serviceCode: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Service',
      required: true,
    },
    amountPaid: {
      type: Number,
      required: [true, 'Amount paid is required'],
      min: [0, 'Amount must be positive'],
    },
    paymentDate: {
      type: Date,
      required: [true, 'Payment date is required'],
    },
    paymentStatus: {
      type: String,
      required: true,
      enum: ['Paid', 'Partial', 'Unpaid'],
      default: 'Unpaid',
    },
    doneBy: {
      type: String,
      required: [true, 'Mechanic name required'],
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Admin',
      required: true,
    },
  },
  { timestamps: true }
);

export default mongoose.model('ServiceRecord', serviceRecordSchema);
