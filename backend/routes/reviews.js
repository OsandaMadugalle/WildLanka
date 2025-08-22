import express from 'express';
import { authenticateToken as auth, requireAdmin } from '../middleware/auth.js';
import upload from '../middleware/upload.js';
import { createReview, getAllReviews, getReviewsByPackage, getUserReviews, getGalleryReviews, deleteReview } from '../controllers/reviewController.js';

const reviewRouter = express.Router();

// Public
reviewRouter.get('/gallery', getGalleryReviews);
reviewRouter.get('/package/:packageId', getReviewsByPackage);

// Authenticated user
reviewRouter.post('/booking/:bookingId', auth, upload.array('images', 5), createReview);
reviewRouter.get('/user', auth, getUserReviews);

// Admin/staff
reviewRouter.get('/all', auth, requireAdmin, getAllReviews);
reviewRouter.delete('/:id', auth, requireAdmin, deleteReview);

export default reviewRouter;


