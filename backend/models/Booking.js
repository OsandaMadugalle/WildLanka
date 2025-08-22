import mongoose from "mongoose";

const bookingSchema = new mongoose.Schema({
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  packageId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Package', 
    required: true 
  },
  packageDetails: {
    title: { type: String, required: true },
    duration: { type: String, required: true },
    location: { type: String, required: true },
    category: { type: String, required: true },
    basePrice: { type: Number, required: true }
  },
  bookingDetails: {
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    numberOfPeople: { type: Number, required: true, min: 1 },
    specialRequests: { type: String },
    emergencyContact: { type: String, required: true },
    dietaryRestrictions: { type: String },
    accommodationPreference: { 
      type: String, 
      enum: ['Standard', 'Luxury', 'Tented Camp', 'Eco Lodge'],
      default: 'Standard'
    },
    transportationPreference: { 
      type: String, 
      enum: ['Included', 'Private Vehicle', 'Shared Vehicle'],
      default: 'Included'
    }
  },
  totalPrice: { 
    type: Number, 
    required: true 
  },
  status: { 
    type: String, 
    enum: [
      'Pending',           // Initial state when booking is placed
      'Payment Confirmed', // Payment has been verified
      'Driver Assigned',   // Driver has been assigned to the booking
      'Guide Assigned',    // Tour guide has been assigned to the booking
      'Confirmed',         // Booking confirmed by staff
      'In Progress',       // Safari is currently happening
      'Completed',         // Safari completed successfully
      'Cancelled'          // Booking has been cancelled
    ], 
    default: 'Pending' 
  },
  driverId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Staff',
    default: null
  },
  driverAccepted: {
    type: Boolean,
    default: false
  },
  driverAcceptedAt: {
    type: Date,
    default: null
  },
  guideId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Staff',
    default: null
  },
  guideAccepted: {
    type: Boolean,
    default: false
  },
  guideAcceptedAt: {
    type: Date,
    default: null
  },
  paymentMethod: { 
    type: String, 
    enum: ['Stripe', 'COD'], 
    required: true 
  },
  payment: { 
    type: Boolean, 
    required: true, 
    default: false 
  },
  stripeSessionId: { type: String },
  stripePaymentIntentId: { type: String },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Update the updatedAt field on save
bookingSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

const Booking = mongoose.model("Booking", bookingSchema);
export default Booking;


