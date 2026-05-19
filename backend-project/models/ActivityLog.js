import mongoose from 'mongoose';

const activityLogSchema = new mongoose.Schema(
  {
    adminId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Admin',
      required: true,
    },
    action: {
      type: String,
      required: true,
      enum: ['CREATE', 'UPDATE', 'DELETE', 'LOGIN', 'LOGOUT', 'VIEW'],
    },
    entity: {
      type: String,
      required: true,
      enum: ['Car', 'Service', 'ServiceRecord', 'Payment', 'Admin'],
    },
    entityId: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    timestamp: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: false }
);

export default mongoose.model('ActivityLog', activityLogSchema);
