import User from "../models/User.js";

// Get all users (admin only)
export const getAllUsers = async (req, res, next) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: "Access denied. Admin only." });
    }

    const users = await User.find({}).select('-passwordHash').sort({ createdAt: -1 });
    return res.json(users);
  } catch (err) {
    next(err);
  }
};

// Delete user (admin only)
export const deleteUser = async (req, res, next) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: "Access denied. Admin only." });
    }

    const userId = req.params.id;
    
    // Prevent admin from deleting themselves
    if (userId === req.user._id.toString()) {
      return res.status(400).json({ message: "Cannot delete your own account" });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Prevent deleting other admins
    if (user.role === 'admin') {
      return res.status(400).json({ message: "Cannot delete admin accounts" });
    }

    await User.findByIdAndDelete(userId);
    return res.json({ message: "User deleted successfully" });
  } catch (err) {
    next(err);
  }
};

// Get user statistics (admin only)
export const getUserStats = async (req, res, next) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: "Access denied. Admin only." });
    }

    const totalUsers = await User.countDocuments({ role: 'user' });
    const totalAdmins = await User.countDocuments({ role: 'admin' });
    const totalStaff = await User.countDocuments({ role: 'staff' });
    const recentUsers = await User.find({}).select('-passwordHash').sort({ createdAt: -1 }).limit(5);

    return res.json({
      totalUsers,
      totalAdmins,
      totalStaff,
      recentUsers
    });
  } catch (err) {
    next(err);
  }
};

