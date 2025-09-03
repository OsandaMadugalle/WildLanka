import mongoose from 'mongoose';

const adminAuditSchema = new mongoose.Schema({
  action: { type: String, required: true },
  adminId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  bookingId: { type: mongoose.Schema.Types.ObjectId, ref: 'Booking' },
  details: { type: Object },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model('AdminAudit', adminAuditSchema);
