// List only approved images for public gallery
export const listApprovedImagesPublic = async (req, res) => {
  try {
    let images;
    try {
      images = await Gallery.find({ status: 'approved' }).populate({ path: 'user', select: 'name email', strictPopulate: false });
    } catch (popErr) {
      images = await Gallery.find({ status: 'approved' });
    }
    res.json({ success: true, images });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};
// ...existing code...
// List images for a specific user (approved/rejected)
export const listUserImages = async (req, res) => {
  try {
    const userId = req.user?._id || req.query.userId;
    if (!userId) {
      return res.status(400).json({ success: false, message: 'Missing userId' });
    }
  const images = await Gallery.find({ user: userId, status: { $in: ['approved', 'rejected', 'pending'] } });
  console.log('[Gallery] listUserImages for user:', userId, 'Images:', images.map(img => ({_id: img._id, status: img.status, title: img.title})));
  res.json({ success: true, images });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
}
import Gallery from '../models/Gallery.js';
import mongoose from 'mongoose';
import { uploadToImgBB } from '../config/imgbb.js';

// Upload new image (user)
export const uploadImage = async (req, res) => {
  try {
    const { userId, userEmail, title, price } = req.body;
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ success: false, message: 'No images uploaded.' });
    }
    const images = [];
    for (const file of req.files) {
      console.log('[Gallery] Upload debug:', {
        userId,
        reqUserId: req.user?._id,
        fileOriginalname: file.originalname,
        fileFieldname: file.fieldname,
        fileSize: file.size,
        bufferType: typeof file.buffer,
        bufferLength: file.buffer?.length,
      });
      let userObjectId;
      if (userId && mongoose.Types.ObjectId.isValid(userId)) {
        userObjectId = new mongoose.Types.ObjectId(userId);
      } else if (req.user && mongoose.Types.ObjectId.isValid(req.user._id)) {
        userObjectId = req.user._id;
      } else {
        console.error('[Gallery] Invalid or missing userId:', userId, req.user?._id);
        throw new Error('Invalid or missing userId');
      }
      // Upload to ImgBB
      let imgbbResult;
      try {
        imgbbResult = await uploadToImgBB(file.buffer, file.originalname);
        console.log('[Gallery] ImgBB upload result:', imgbbResult);
      } catch (err) {
        console.error('[Gallery] ImgBB upload failed:', err);
        return res.status(500).json({ success: false, error: 'Image upload failed: ' + err.message });
      }
      // Calculate commission as 5% of price (if price is set)
      const numericPrice = parseFloat(price) || 0;
      const commission = numericPrice > 0 ? (numericPrice * 0.05) : 0;
      const image = new Gallery({
        user: userObjectId,
        title: title || 'Untitled',
        price: numericPrice,
        imageUrl: imgbbResult.url,
        status: 'pending',
        commission,
      });
      await image.save();
      images.push(image);
    }
    res.status(201).json({ success: true, images });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// List all images (admin)
export const listImages = async (req, res) => {
  try {
    let images;
    try {
      images = await Gallery.find().populate({ path: 'user', select: 'name email', strictPopulate: false });
    } catch (popErr) {
      // Fallback: return without population if error
      images = await Gallery.find();
    }
    res.json({ success: true, images });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// Approve image (admin)
export const approveImage = async (req, res) => {
  try {
    const { id } = req.params;
    const { commission } = req.body;
    const image = await Gallery.findByIdAndUpdate(id, { status: 'approved', commission }, { new: true });
    res.json({ success: true, image });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// Reject image (admin)
export const rejectImage = async (req, res) => {
  try {
    const { id } = req.params;
    const image = await Gallery.findByIdAndUpdate(id, { status: 'rejected' }, { new: true });
    res.json({ success: true, image });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// Delete image (admin/user)
export const deleteImage = async (req, res) => {
  try {
    const { id } = req.params;
    await Gallery.findByIdAndDelete(id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};
