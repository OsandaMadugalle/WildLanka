import mongoose from 'mongoose';

const payrollSchema = new mongoose.Schema({
  staffId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Staff',
    required: true
  },
  month: {
    type: Number,
    required: true,
    min: 1,
    max: 12
  },
  year: {
    type: Number,
    required: true,
    min: 2020,
    max: 2030
  },
  // Basic salary information
  basicSalary: {
    type: Number,
    required: true,
    min: 0
  },
  // Working hours and calculations
  totalWorkingDays: {
    type: Number,
    default: 0
  },
  totalWorkingHours: {
    type: Number,
    default: 0
  },
  regularHours: {
    type: Number,
    default: 0
  },
  overtimeHours: {
    type: Number,
    default: 0
  },
  // Salary components
  regularPay: {
    type: Number,
    default: 0
  },
  overtimePay: {
    type: Number,
    default: 0
  },
  // Deductions and additions
  deductions: {
    type: Number,
    default: 0
  },
  bonuses: {
    type: Number,
    default: 0
  },
  allowances: {
    type: Number,
    default: 0
  },
  // Final calculations
  grossPay: {
    type: Number,
    default: 0
  },
  netPay: {
    type: Number,
    default: 0
  },
  // Status and approval
  status: {
    type: String,
    enum: ['draft', 'pending', 'approved', 'paid', 'cancelled'],
    default: 'draft'
  },
  approvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  approvedAt: {
    type: Date,
    default: null
  },
  paidAt: {
    type: Date,
    default: null
  },
  // Additional information
  notes: {
    type: String,
    default: ''
  },
  // Payment method
  paymentMethod: {
    type: String,
    enum: ['bank_transfer', 'cash', 'check'],
    default: 'bank_transfer'
  },
  // Bank details for transfer
  bankDetails: {
    accountNumber: String,
    bankName: String,
    branchCode: String
  }
}, {
  timestamps: true
});

// Compound index to ensure one payroll record per staff per month
payrollSchema.index({ staffId: 1, month: 1, year: 1 }, { unique: true });

// Virtual for formatted month-year
payrollSchema.virtual('monthYear').get(function() {
  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  return `${months[this.month - 1]} ${this.year}`;
});

// Virtual for formatted status
payrollSchema.virtual('statusFormatted').get(function() {
  return this.status.charAt(0).toUpperCase() + this.status.slice(1);
});

// Method to calculate payroll
payrollSchema.methods.calculatePayroll = function() {
  console.log('=== BACKEND PAYROLL CALCULATION DEBUG ===');
  console.log('Input values:');
  console.log('- totalWorkingDays:', this.totalWorkingDays);
  console.log('- totalWorkingHours:', this.totalWorkingHours);
  console.log('- basicSalary:', this.basicSalary);
  console.log('- bonuses:', this.bonuses);
  console.log('- allowances:', this.allowances);
  console.log('- deductions:', this.deductions);
  
  // Calculate regular hours (8 hours per day is standard)
  const standardHoursPerDay = 8;
  
  // Calculate regular and overtime hours
  this.regularHours = Math.min(this.totalWorkingHours, this.totalWorkingDays * standardHoursPerDay);
  this.overtimeHours = Math.max(0, this.totalWorkingHours - this.regularHours);
  
  console.log('Calculated hours:');
  console.log('- standardHoursPerDay:', standardHoursPerDay);
  console.log('- regularHours:', this.regularHours);
  console.log('- overtimeHours:', this.overtimeHours);
  
  // Calculate pay rates - EXACTLY like frontend
  // Regular pay: pro-rated based on actual working hours vs standard hours
  let regularPay = 0;
  if (this.totalWorkingDays > 0 && this.totalWorkingHours > 0) {
    const standardHoursForWorkingDays = this.totalWorkingDays * standardHoursPerDay;
    const actualRegularHours = Math.min(this.totalWorkingHours, standardHoursForWorkingDays);
    regularPay = (actualRegularHours / standardHoursForWorkingDays) * this.basicSalary;
    
    console.log('Regular pay calculation:');
    console.log('- standardHoursForWorkingDays:', standardHoursForWorkingDays);
    console.log('- actualRegularHours:', actualRegularHours);
    console.log('- regularPay calculation:', `(${actualRegularHours} / ${standardHoursForWorkingDays}) × ${this.basicSalary} = ${regularPay}`);
  }
  this.regularPay = regularPay;
  
  // Overtime pay: LKR 1,000 per overtime hour (EXACTLY like frontend)
  const overtimeRatePerHour = 1000; // LKR 1,000 per overtime hour
  this.overtimePay = this.overtimeHours * overtimeRatePerHour;
  
  console.log('Overtime pay calculation:');
  console.log('- overtimeRatePerHour:', overtimeRatePerHour);
  console.log('- overtimePay calculation:', `${this.overtimeHours} × ${overtimeRatePerHour} = ${this.overtimePay}`);
  
  // Calculate gross and net pay - EXACTLY like frontend
  this.grossPay = this.regularPay + this.overtimePay + (this.bonuses || 0) + (this.allowances || 0);
  this.netPay = this.grossPay - (this.deductions || 0);
  
  console.log('Final calculations:');
  console.log('- grossPay calculation:', `${this.regularPay} + ${this.overtimePay} + ${this.bonuses || 0} + ${this.allowances || 0} = ${this.grossPay}`);
  console.log('- netPay calculation:', `${this.grossPay} - ${this.deductions || 0} = ${this.netPay}`);
  
  console.log('Final calculated values:');
  console.log('- regularPay:', this.regularPay);
  console.log('- overtimePay:', this.overtimePay);
  console.log('- grossPay:', this.grossPay);
  console.log('- netPay:', this.netPay);
  console.log('========================================');
  
  return {
    regularPay: this.regularPay,
    overtimePay: this.overtimePay,
    grossPay: this.grossPay,
    netPay: this.netPay
  };
};

// Pre-save middleware to calculate payroll
payrollSchema.pre('save', function(next) {
  if (this.isModified('totalWorkingHours') || 
      this.isModified('basicSalary') || 
      this.isModified('deductions') || 
      this.isModified('bonuses') || 
      this.isModified('allowances')) {
    this.calculatePayroll();
  }
  next();
});

const Payroll = mongoose.model('Payroll', payrollSchema);

export default Payroll;
