import mongoose from 'mongoose';

const attendanceSchema = new mongoose.Schema({
  staffId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Staff',
    required: true
  },
  date: {
    type: Date,
    required: true,
    default: Date.now
  },
  checkIn: {
    time: {
      type: Date,
      default: null
    },
    location: {
      type: String,
      default: null
    }
  },
  checkOut: {
    time: {
      type: Date,
      default: null
    },
    location: {
      type: String,
      default: null
    }
  },
  status: {
    type: String,
    enum: ['present', 'absent', 'late', 'half-day', 'leave'],
    default: 'absent'
  },
  totalHours: {
    type: Number,
    default: 0
  },
  notes: {
    type: String,
    default: ''
  },
  approvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  isApproved: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Compound index to ensure one attendance record per staff per date
attendanceSchema.index({ staffId: 1, date: 1 }, { unique: true });

// Virtual for formatted date
attendanceSchema.virtual('formattedDate').get(function() {
  return this.date.toISOString().split('T')[0];
});

// Virtual for check-in time string
attendanceSchema.virtual('checkInTimeString').get(function() {
  return this.checkIn.time ? this.checkIn.time.toLocaleTimeString('en-US', { 
    hour: '2-digit', 
    minute: '2-digit',
    hour12: true 
  }) : 'Not checked in';
});

// Virtual for check-out time string
attendanceSchema.virtual('checkOutTimeString').get(function() {
  return this.checkOut.time ? this.checkOut.time.toLocaleTimeString('en-US', { 
    hour: '2-digit', 
    minute: '2-digit',
    hour12: true 
  }) : 'Not checked out';
});

// Method to calculate total hours
attendanceSchema.methods.calculateTotalHours = function() {
  if (this.checkIn.time && this.checkOut.time) {
    const diffMs = this.checkOut.time - this.checkIn.time;
    const diffHrs = diffMs / (1000 * 60 * 60);
    this.totalHours = Math.round(diffHrs * 100) / 100; // Round to 2 decimal places
  }
  return this.totalHours;
};

// Pre-save middleware to calculate total hours
attendanceSchema.pre('save', function(next) {
  if (this.checkIn.time && this.checkOut.time) {
    this.calculateTotalHours();
  }
  next();
});

export default mongoose.model('Attendance', attendanceSchema);
