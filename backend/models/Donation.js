import mongoose from 'mongoose';

const donationSchema = new mongoose.Schema({
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
    trim: true,
    lowercase: true
  },
  phone: {
    type: String,
    trim: true
  },
  address: {
    type: String,
    required: true,
    trim: true
  },
  country: {
    type: String,
    required: true,
    trim: true
  },
  postalCode: {
    type: String,
    required: true,
    trim: true
  },
  amount: {
    type: Number,
    required: true,
    min: 0
  },
  currency: {
    type: String,
    required: true,
    uppercase: true,
    default: 'USD'
  },
  isAnonymous: {
    type: Boolean,
    default: false
  },
  receiveUpdates: {
    type: Boolean,
    default: true
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'completed', 'failed'],
    default: 'pending'
  },
  stripeSessionId: {
    type: String,
    sparse: true
  },
  stripePaymentIntentId: {
    type: String,
    unique: true,
    sparse: true
  },
  metadata: {
    type: Map,
    of: String
  }
}, {
  timestamps: true
});

// Index for efficient queries
donationSchema.index({ email: 1, createdAt: -1 });
donationSchema.index({ paymentStatus: 1, createdAt: -1 });
donationSchema.index({ stripeSessionId: 1, unique: true, sparse: true });

const Donation = mongoose.model('Donation', donationSchema);

export default Donation;
