import mongoose from 'mongoose';
import bcryptjs from 'bcryptjs';

const adminSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: [true, 'Username is required'],
      unique: true,
      trim: true,
      minlength: 3,
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: 6,
    },
    securityQuestion: {
      type: String,
      required: [true, 'Security question is required'],
    },
    securityAnswer: {
      type: String,
      required: [true, 'Security answer is required'],
    },
    role: {
      type: String,
      default: 'Admin',
      enum: ['Admin'],
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

// Hash password before saving
adminSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcryptjs.genSalt(10);
    this.password = await bcryptjs.hash(this.password, salt);
    // Hash security answer
    this.securityAnswer = await bcryptjs.hash(this.securityAnswer, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Method to compare password
adminSchema.methods.comparePassword = async function (enteredPassword) {
  return await bcryptjs.compare(enteredPassword, this.password);
};

// Method to compare security answer
adminSchema.methods.compareSecurityAnswer = async function (enteredAnswer) {
  return await bcryptjs.compare(enteredAnswer, this.securityAnswer);
};

export default mongoose.model('Admin', adminSchema);
