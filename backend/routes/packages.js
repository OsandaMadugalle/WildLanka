import { Router } from "express";
import { 
  getAllPackages, 
  getPackageById, 
  createPackage, 
  updatePackage, 
  deletePackage, 
  uploadPackageImage,
  togglePackageStatus
} from "../controllers/packageController.js";
import { authenticateToken } from "../middleware/auth.js";
import upload from "../middleware/upload.js";

const router = Router();

// Public routes
router.get("/", getAllPackages);
router.get("/:id", getPackageById);

// Protected routes (admin only)
router.post("/", authenticateToken, createPackage);
router.put("/:id", authenticateToken, updatePackage);
router.delete("/:id", authenticateToken, deletePackage);
router.post("/:id/image", authenticateToken, upload.single('image'), uploadPackageImage);
router.patch("/:id/toggle-status", authenticateToken, togglePackageStatus);

export default router;
