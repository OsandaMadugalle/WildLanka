
import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import User from "../models/User.js";
import Staff from "../models/Staff.js";

// ...existing code...

// Named exports for gallery/admin routes
export { authenticateToken as isAuthenticated, requireAdmin as isAdmin };

const getJwtSecret = () => {
  const secret = process.env.JWT_SECRET || "dev_secret_change_me";
  return secret;
};

export const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      return res.status(401).json({ message: "Access token required" });
    }

    const decoded = jwt.verify(token, getJwtSecret());
    
  // Special handling for admin@wildlanka.com
  if (decoded.email === 'admin@wildlanka.com' && decoded.role === 'admin') {
      // Create a proper ObjectId for admin user
      const adminId = new mongoose.Types.ObjectId();
      req.user = {
        _id: adminId,
        id: adminId,
        firstName: 'Admin',
        lastName: 'User',
  email: 'admin@wildlanka.com',//Admin email
        phone: '',
        role: 'admin',
        isActive: true,
        profilePicture: null,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      return next();
    }
    
    // Try to find user in User collection first
    let user = await User.findById(decoded.userId).select('-passwordHash');
    
    // If not found in User collection, try Staff collection
    if (!user) {
      const staff = await Staff.findById(decoded.userId).select('-passwordHash');
      if (staff) {
        // Convert staff to user format
        user = {
          _id: staff._id,
          id: staff._id,
          firstName: staff.firstName,
          lastName: staff.lastName,
          email: staff.email,
          phone: staff.phone,
          role: staff.role,
          isActive: staff.isActive,
          profilePicture: staff.profilePicture,
          createdAt: staff.createdAt,
          updatedAt: staff.updatedAt
        };
      }
    }
    
    if (!user) {
      return res.status(401).json({ message: "Invalid token" });
    }
    
    // Set user info in request
    req.user = user;
    
    // If token has role field, use it; otherwise use user's role from database
    if (decoded.role) {
      req.user.role = decoded.role;
    }

    next();
  } catch (err) {
    if (err.name === 'JsonWebTokenError') {
      return res.status(401).json({ message: "Invalid token" });
    }
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ message: "Token expired" });
    }
    return res.status(500).json({ message: "Authentication error" });
  }
};

export const requireAdmin = async (req, res, next) => {
  try {
    console.log('requireAdmin debug:', req.user);
    // Allow admin if role/userType is 'admin' or email is admin@wildlanka.com
    if (
      req.user.role === 'admin' ||
      req.user.userType === 'admin' ||
      req.user.email === 'admin@wildlanka.com'
    ) {
      return next();
    }
    return res.status(403).json({ message: "Admin access required" });
  } catch (error) {
    return res.status(500).json({ message: "Authorization error" });
  }
};

export const requireStaff = async (req, res, next) => {
// Aliases for gallery routes
  try {
    // Check if user is staff or admin (authenticateToken already ran)
    if (req.user.role !== 'staff' && req.user.role !== 'admin') {
      return res.status(403).json({ message: "Staff or admin access required" });
    }
    
    next();
    
  } catch (error) {
    return res.status(500).json({ message: "Authorization error" });
  }
};
