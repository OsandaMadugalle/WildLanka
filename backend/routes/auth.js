import { Router } from "express";
import { register, login, staffLogin, updateProfile, uploadProfilePicture } from "../controllers/authController.js";
import { authenticateToken } from "../middleware/auth.js";
import upload from "../middleware/upload.js";

const router = Router();

router.post("/register", register);
router.post("/login", login);
router.post("/staff-login", staffLogin);
router.put("/profile", authenticateToken, updateProfile);
router.post("/profile-picture", authenticateToken, upload.single('profilePicture'), uploadProfilePicture);

export default router;


