// ...existing code...
import express from 'express';
import { uploadImage, listImages, approveImage, rejectImage, deleteImage, listUserImages, listApprovedImagesPublic } from '../controllers/galleryController.js';
import { isAdmin, isAuthenticated } from '../middleware/auth.js';
import upload from '../middleware/upload.js';
const router = express.Router();
// Public: List only approved images
router.get('/public/approved', listApprovedImagesPublic);
// User lists their own gallery images
router.get('/user/list', isAuthenticated, listUserImages);

// User uploads image

// User uploads image
router.post('/upload', isAuthenticated, upload.array('images'), uploadImage);


// Admin lists all images
router.get('/admin/list', isAuthenticated, isAdmin, listImages);

// Admin approves image
router.post('/admin/approve/:id', isAuthenticated, isAdmin, approveImage);

// Admin rejects image
router.post('/admin/reject/:id', isAuthenticated, isAdmin, rejectImage);

// Delete image (admin or user)
router.delete('/:id', isAuthenticated, deleteImage);

export default router;
