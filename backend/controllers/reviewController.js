// Update a review (admin or review author)
export const updateReview = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;
    const isAdmin = req.user.role === 'admin' || req.user.role === 'superadmin';
    const review = await Review.findById(id);
    if (!review) {
      return res.status(404).json({ message: "Review not found" });
    }
    if (!isAdmin && review.userId.toString() !== userId?.toString()) {
      return res.status(403).json({ message: "You are not authorized to edit this review" });
    }
    // Only allow updating rating, comment, and images
    const { rating, comment } = req.body;
    if (rating !== undefined) review.rating = rating;
    if (comment !== undefined) review.comment = comment;
    // Handle images (optional, not implemented here for simplicity)
    await review.save();
    // Recalculate package stats
    try {
      const stats = await Review.aggregate([
        { $match: { packageId: review.packageId } },
        { $group: { _id: "$packageId", avgRating: { $avg: "$rating" }, count: { $sum: 1 } } },
      ]);
      if (stats.length > 0) {
        await Package.findByIdAndUpdate(review.packageId, {
          rating: Math.round(stats[0].avgRating * 10) / 10,
          reviews: stats[0].count,
        });
      } else {
        await Package.findByIdAndUpdate(review.packageId, { rating: 0, reviews: 0 });
      }
    } catch (aggErr) {
      console.error("Failed to update package rating stats", aggErr);
    }
    return res.json({ success: true, message: "Review updated", review });
  } catch (err) {
    next(err);
  }
};
import Review from "../models/Review.js";
import Booking from "../models/Booking.js";
import Package from "../models/Package.js";
import { uploadToImgBB } from "../config/imgbb.js";

// Create a review for a completed booking
export const createReview = async (req, res, next) => {
  try {
    const { bookingId } = req.params;
    const userId = req.user._id;
    const { rating, comment } = req.body;

    if (!rating) {
      return res.status(400).json({ message: "Rating is required" });
    }

    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    if (booking.userId.toString() !== userId.toString()) {
      return res.status(403).json({ message: "You can review only your own bookings" });
    }

    if (booking.status !== "Completed") {
      return res.status(400).json({ message: "You can review only completed bookings" });
    }

    const existing = await Review.findOne({ bookingId });
    if (existing) {
      return res.status(400).json({ message: "You have already submitted a review for this booking" });
    }

    // Fetch package title to store it permanently
    const packageData = await Package.findById(booking.packageId).select('title');
    if (!packageData) {
      return res.status(404).json({ message: "Package not found" });
    }

    // Handle images (optional)
    let images = [];
    if (req.files && Array.isArray(req.files)) {
      for (const file of req.files) {
        const filename = `review_${booking.packageId}_${userId}_${Date.now()}`;
        const uploaded = await uploadToImgBB(file.buffer, filename);
        images.push({ url: uploaded.url, deleteUrl: uploaded.deleteUrl, id: uploaded.id });
      }
    }

    const review = await Review.create({
      userId,
      packageId: booking.packageId,
      packageTitle: packageData.title,
      bookingId: booking._id,
      rating: Number(rating),
      comment: comment || "",
      images,
    });

    // Update package aggregate rating and reviews count
    try {
      const stats = await Review.aggregate([
        { $match: { packageId: booking.packageId } },
        { $group: { _id: "$packageId", avgRating: { $avg: "$rating" }, count: { $sum: 1 } } },
      ]);
      if (stats.length > 0) {
        await Package.findByIdAndUpdate(booking.packageId, {
          rating: Math.round(stats[0].avgRating * 10) / 10,
          reviews: stats[0].count,
        });
      }
    } catch (aggErr) {
      console.error("Failed to update package rating stats", aggErr);
    }

    return res.status(201).json({ review, message: "Review submitted successfully" });
  } catch (err) {
    next(err);
  }
};

// Get all reviews (admin)
export const getAllReviews = async (req, res, next) => {
  try {
    const reviews = await Review.find()
      .populate("userId", "firstName lastName email")
      .populate("packageId", "title location")
      .sort({ createdAt: -1 });
    return res.json({ reviews });
  } catch (err) {
    next(err);
  }
};

// Get reviews for a package (public)
export const getReviewsByPackage = async (req, res, next) => {
  try {
    const { packageId } = req.params;
    const reviews = await Review.find({ packageId })
      .populate("userId", "firstName lastName")
      .sort({ createdAt: -1 });
    return res.json({ reviews });
  } catch (err) {
    next(err);
  }
};

// Get user's own reviews
export const getUserReviews = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const reviews = await Review.find({ userId })
      .populate("packageId", "title location")
      .sort({ createdAt: -1 });
    return res.json({ reviews });
  } catch (err) {
    next(err);
  }
};

// Get all reviews for gallery (public)
export const getGalleryReviews = async (req, res, next) => {
  try {
    const reviews = await Review.find()
      .populate("userId", "firstName lastName")
      .populate("packageId", "title location")
      .sort({ createdAt: -1 });
    return res.json({ reviews });
  } catch (err) {
    next(err);
  }
};

// Delete a review (admin or review author)
export const deleteReview = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;
    const isAdmin = req.user.role === 'admin' || req.user.role === 'superadmin';
    const review = await Review.findById(id);
    console.log('[deleteReview] req.user:', req.user);
    console.log('[deleteReview] userId:', userId, 'type:', typeof userId);
    console.log('[deleteReview] review.userId:', review ? review.userId : null, 'type:', review && review.userId ? typeof review.userId : 'null');
    if (review && review.userId) {
      console.log('[deleteReview] userId.toString():', userId?.toString());
      console.log('[deleteReview] review.userId.toString():', review.userId.toString());
      console.log('[deleteReview] userId === review.userId:', userId?.toString() === review.userId.toString());
    }
    if (!review) {
      return res.status(404).json({ message: "Review not found" });
    }
    // Only allow if admin or review author
    if (!isAdmin && review.userId.toString() !== userId?.toString()) {
      return res.status(403).json({ message: "You are not authorized to delete this review" });
    }
    await Review.findByIdAndDelete(id);
    // Recalculate package stats
    try {
      const stats = await Review.aggregate([
        { $match: { packageId: review.packageId } },
        { $group: { _id: "$packageId", avgRating: { $avg: "$rating" }, count: { $sum: 1 } } },
      ]);
      if (stats.length > 0) {
        await Package.findByIdAndUpdate(review.packageId, {
          rating: Math.round(stats[0].avgRating * 10) / 10,
          reviews: stats[0].count,
        });
      } else {
        await Package.findByIdAndUpdate(review.packageId, { rating: 0, reviews: 0 });
      }
    } catch (aggErr) {
      console.error("Failed to update package rating stats", aggErr);
    }
  return res.json({ success: true, message: "Review deleted" });
  } catch (err) {
    next(err);
  }
};

// Get public reviews for external users (for carousel, homepage, etc)
export const getPublicReviews = async (req, res, next) => {
  try {
    // You can filter by isPublic, approved, etc. For now, show all reviews
    const reviews = await Review.find({})
      .populate("userId", "firstName lastName")
      .populate("packageId", "title location")
      .sort({ createdAt: -1 });
    return res.json({ reviews });
  } catch (err) {
    next(err);
  }
};


