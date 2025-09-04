import { Router } from "express";
import { getAllUsers, deleteUser, getUserStats } from "../controllers/userController.js";
import User from "../models/User.js";
import { authenticateToken } from "../middleware/auth.js";

const router = Router();

// All routes require authentication and admin role
router.use(authenticateToken);

// Get all users
router.get("/", getAllUsers);

// Get user statistics
router.get("/stats", getUserStats);

// Get current authenticated user's info
router.get("/me", async (req, res) => {
		try {
			// req.user is set by authenticateToken middleware
			if (!req.user) {
				console.error("/me route: req.user missing");
				return res.status(401).json({ message: "Not authenticated" });
			}
			// Fetch user from DB to get latest info
			console.log("/me route: req.user", req.user);
			const user = await User.findById(req.user._id).select("-passwordHash");
			if (!user) {
				console.error(`/me route: User not found for id ${req.user._id}`);
				return res.status(404).json({ message: "User not found" });
			}
			res.json(user);
		} catch (err) {
			console.error("/me route error:", err);
			res.status(500).json({ message: "Server error", error: err.message });
		}
});

// Delete user
router.delete("/:id", deleteUser);

export default router;

