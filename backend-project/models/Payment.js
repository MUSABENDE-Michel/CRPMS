import mongoose from 'mongoose';

const paymentSchema = new mongoose.Schema(
  {
    serviceRecordId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ServiceRecord',
      required: true,
    },
    paymentDate: {
      type: Date,
      required: [true, 'Payment date is required'],
    },
    amountPaid: {
      type: Number,
      required: [true, 'Amount paid is required'],
      min: [0, 'Amount must be positive'],
    },
    receivedBy: {
      type: String,
      required: [true, 'Received by is required'],
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Admin',
      required: true,
    },
    paymentMethod: {
      type: String,
      enum: ['Cash', 'Check', 'Card', 'Transfer'],
      default: 'Cash',
    },
  },
  { timestamps: true }
);

export default mongoose.model('Payment', paymentSchema);
