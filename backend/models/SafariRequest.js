import mongoose from "mongoose";

const safariRequestSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true
    },
    phone: {
      type: String,
      required: true,
      trim: true
    },
    preferredDates: {
      type: String,
      required: true,
      trim: true
    },
    groupSize: {
      type: String,
      required: true,
      trim: true
    },
    duration: {
      type: String,
      required: true,
      trim: true
    },
    budget: {
      type: String,
      trim: true
    },
    preferredLocations: {
      type: String,
      trim: true
    },
    wildlifeInterests: {
      type: String,
      trim: true
    },
    specialRequirements: {
      type: String,
      trim: true
    },
    status: {
      type: String,
      enum: ['pending', 'reviewed', 'approved', 'rejected', 'completed'],
      default: 'pending'
    },
    adminNotes: {
      type: String,
      trim: true
    },
    estimatedPrice: {
      type: Number
    },
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Staff'
    }
  },
  { timestamps: true }
);

const SafariRequest = mongoose.model("SafariRequest", safariRequestSchema);

export default SafariRequest;
