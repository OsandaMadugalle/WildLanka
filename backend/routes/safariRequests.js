import express from "express";
import { 
  getAllSafariRequests, 
  getSafariRequestById, 
  createSafariRequest, 
  updateSafariRequestStatus, 
  deleteSafariRequest,
  getSafariRequestStats
} from "../controllers/safariRequestController.js";
import { authenticateToken as auth } from "../middleware/auth.js";

const router = express.Router();

// Public routes (no authentication required)
router.post("/", createSafariRequest);

// Protected routes (admin only)
router.get("/", auth, getAllSafariRequests);
router.get("/stats", auth, getSafariRequestStats);
router.patch("/:id/status", auth, updateSafariRequestStatus);
router.delete("/:id", auth, deleteSafariRequest);
router.get("/:id", auth, getSafariRequestById);

export default router;
