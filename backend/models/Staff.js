import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const staffSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: true,
      trim: true
    },
    lastName: {
      type: String,
      required: true,
      trim: true
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true
    },
    passwordHash: {
      type: String,
      required: true
    },
    phone: {
      type: String,
      required: true
    },
    role: {
      type: String,
      required: true,
      enum: ['driver', 'tour_guide']
    },
    specialization: {
      type: String,
      trim: true
    },
    experience: {
      type: Number,
      default: 0
    },
    licenseNumber: {
      type: String,
      trim: true
    },
    isActive: {
      type: Boolean,
      default: true
    },
    basicSalary: {
      type: Number,
      min: 0
    },
    profilePicture: {
      url: { type: String },
      deleteUrl: { type: String },
      id: { type: String }
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: false
    }
  },
  { timestamps: true }
);

// Hash password before saving
staffSchema.pre('save', async function(next) {
  if (!this.isModified('passwordHash')) return next();
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.passwordHash = await bcrypt.hash(this.passwordHash, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Method to compare password
staffSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.passwordHash);
};

const Staff = mongoose.model("Staff", staffSchema);

export default Staff;
