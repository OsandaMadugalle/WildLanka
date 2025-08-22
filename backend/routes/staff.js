import express from "express";
import {
  getAllStaff,
  getStaffById,
  createStaff,
  updateStaff,
  deleteStaff,
  staffLogin,
  uploadStaffProfilePicture,
  toggleStaffStatus
} from "../controllers/staffController.js";
import { authenticateToken as auth } from "../middleware/auth.js";
import upload from "../middleware/upload.js";

const router = express.Router();

// Staff login (public route)
router.post("/login", staffLogin);

// Protected routes (admin only)
router.get("/", auth, getAllStaff);
router.get("/:id", auth, getStaffById);
router.post("/", auth, createStaff);
router.put("/:id", auth, updateStaff);
router.delete("/:id", auth, deleteStaff);
router.patch("/:id/toggle-status", auth, toggleStaffStatus);

// Upload profile picture
router.post("/:id/profile-picture", auth, upload.single('image'), uploadStaffProfilePicture);

export default router;
