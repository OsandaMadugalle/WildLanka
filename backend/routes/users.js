import { Router } from "express";
import { getAllUsers, deleteUser, getUserStats } from "../controllers/userController.js";
import { authenticateToken } from "../middleware/auth.js";

const router = Router();

// All routes require authentication and admin role
router.use(authenticateToken);

// Get all users
router.get("/", getAllUsers);

// Get user statistics
router.get("/stats", getUserStats);

// Delete user
router.delete("/:id", deleteUser);

export default router;

