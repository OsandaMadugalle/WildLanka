import mongoose from 'mongoose';

const gallerySchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true },
  price: { type: Number, required: true },
  imageUrl: { type: String, required: true },
  status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
  commission: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
});

const Gallery = mongoose.model('Gallery', gallerySchema);
export default Gallery;
