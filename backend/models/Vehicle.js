import mongoose from "mongoose";

const vehicleSchema = new mongoose.Schema({
  driverId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Staff',
    required: true
  },
  vehicleType: {
    type: String,
    required: true,
    enum: ['Safari Jeep', 'SUV', 'Van', 'Bus', 'Other']
  },
  make: {
    type: String,
    required: true,
    trim: true
  },
  model: {
    type: String,
    required: true,
    trim: true
  },
  year: {
    type: Number,
    required: true,
    min: 1900,
    max: new Date().getFullYear() + 1
  },
  licensePlate: {
    type: String,
    required: true,
    trim: true,
    uppercase: true
  },
  color: {
    type: String,
    required: true,
    trim: true
  },
  capacity: {
    type: Number,
    required: true,
    min: 1,
    max: 50
  },
  fuelType: {
    type: String,
    required: true,
    enum: ['Petrol', 'Diesel', 'Electric', 'Hybrid', 'Other']
  },
  transmission: {
    type: String,
    enum: ['Manual', 'Automatic'],
    default: 'Manual'
  },
  insuranceNumber: {
    type: String,
    required: true,
    trim: true
  },
  insuranceExpiry: {
    type: Date,
    required: true
  },
  registrationNumber: {
    type: String,
    trim: true
  },
  registrationExpiry: {
    type: Date
  },
  lastServiceDate: {
    type: Date,
    default: null
  },
  nextServiceDate: {
    type: Date,
    default: null
  },
  mileage: {
    type: Number,
    default: 0,
    min: 0
  },
  isActive: {
    type: Boolean,
    default: true
  },
  isAvailable: {
    type: Boolean,
    default: true
  },
  features: [{
    type: String,
    trim: true
  }],
  notes: {
    type: String,
    trim: true
  },
  images: [{
    url: { type: String },
    deleteUrl: { type: String },
    id: { type: String }
  }],
  documents: [{
    name: { type: String, required: true },
    url: { type: String, required: true },
    deleteUrl: { type: String },
    id: { type: String },
    type: { 
      type: String, 
      enum: ['Insurance', 'Registration', 'Service Record', 'Other'],
      required: true 
    }
  }],
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, { timestamps: true });

// Index for efficient queries
vehicleSchema.index({ driverId: 1, isActive: 1 });
vehicleSchema.index({ licensePlate: 1, unique: true });
vehicleSchema.index({ isAvailable: 1 });

const Vehicle = mongoose.model("Vehicle", vehicleSchema);
export default Vehicle;
