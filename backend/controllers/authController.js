import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import Staff from "../models/Staff.js";
import { uploadToImgBB } from "../config/imgbb.js";

const getJwtSecret = () => {
  const secret = process.env.JWT_SECRET || "dev_secret_change_me";
  return secret;
};

export const register = async (req, res, next) => {
  try {
    const { firstName, lastName, email, phone, country, password } = req.body;

    if (!firstName || !lastName || !email || !password) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(409).json({ message: "Email already in use" });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const user = await User.create({
      firstName,
      lastName,
      email,
      phone,
      country,
      passwordHash,
    });

    const token = jwt.sign({ userId: user._id }, getJwtSecret(), { expiresIn: "7d" });

    return res.status(201).json({
      token,
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phone: user.phone,
        country: user.country,
        profilePicture: user.profilePicture,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
    });
  } catch (err) {
    next(err);
  }
};

export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const isValid = await bcrypt.compare(password, user.passwordHash);
    if (!isValid) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign({ userId: user._id }, getJwtSecret(), { expiresIn: "7d" });

    return res.json({
      token,
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phone: user.phone,
        country: user.country,
        role: user.role,
        profilePicture: user.profilePicture,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
    });
  } catch (err) {
    next(err);
  }
};

export const staffLogin = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

  // Special handling for admin@wildlanka.com
  if (email === 'admin@wildlanka.com') {
      if (password === 'admin123') {//Admin password
        // Create admin user object
        const adminUser = {
          id: 'admin_user_id_12345',
          _id: 'admin_user_id_12345',
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

        // Create JWT token
        const token = jwt.sign(
          { 
            userId: adminUser.id, 
            email: adminUser.email, 
            role: adminUser.role,
            userType: 'admin'
          },
          getJwtSecret(),
          { expiresIn: '24h' }
        );

        return res.json({
          token,
          user: {
            id: adminUser.id,
            _id: adminUser.id,
            firstName: adminUser.firstName,
            lastName: adminUser.lastName,
            email: adminUser.email,
            phone: adminUser.phone,
            role: adminUser.role,
            isActive: adminUser.isActive,
            profilePicture: adminUser.profilePicture,
            createdAt: adminUser.createdAt,
            updatedAt: adminUser.updatedAt
          }
        });
      } else {
        return res.status(401).json({ message: "Invalid credentials" });
      }
    }

    // Check in User collection first
    let user = await User.findOne({ email });
    let userType = 'user';
    
    // If not found in User collection, check Staff collection (by email only)
    if (!user) {
      const staff = await Staff.findOne({ email });
      if (!staff) {
        return res.status(401).json({ message: "Staff not found for this email" });
      }
      // Check if staff is active
      if (!staff.isActive) {
        return res.status(401).json({ message: "Account is deactivated" });
      }
      // Verify staff password
      const isPasswordValid = await staff.comparePassword(password);
      if (!isPasswordValid) {
        return res.status(401).json({ message: "Invalid password" });
      }
      // Convert staff to user format
      user = {
        _id: staff._id,
        id: staff._id,
        firstName: staff.firstName,
        lastName: staff.lastName,
        email: staff.email,
        phone: staff.phone || '',
        role: staff.role,
        isActive: staff.isActive,
        profilePicture: staff.profilePicture,
        basicSalary: staff.basicSalary,
        createdAt: staff.createdAt,
        updatedAt: staff.updatedAt
      };
      userType = 'staff';
    } else {
      // User found in User collection
      // Check if user is staff or admin
      if (user.role !== 'admin' && user.role !== 'staff') {
        return res.status(403).json({ message: "Access denied. Staff login only." });
      }

      const isValid = await bcrypt.compare(password, user.passwordHash);
      if (!isValid) {
        return res.status(401).json({ message: "Invalid credentials" });
      }
      
      userType = user.role;
    }

    const token = jwt.sign({ 
      userId: user._id, 
      email: user.email,
      role: user.role,
      userType: userType
    }, getJwtSecret(), { expiresIn: "7d" });

    return res.json({
      token,
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phone: user.phone,
        country: user.country,
        role: user.role,
        profilePicture: user.profilePicture,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
    });
  } catch (err) {
    next(err);
  }
};

export const updateProfile = async (req, res, next) => {
  try {
    const { firstName, lastName, email, phone, country, currentPassword, newPassword } = req.body;
    const userId = req.user._id;

    if (!firstName || !lastName || !email) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    // Check if email is already taken by another user
    const existingUser = await User.findOne({ email, _id: { $ne: userId } });
    if (existingUser) {
      return res.status(409).json({ message: "Email already in use" });
    }

    // Get current user to check password
    const currentUser = await User.findById(userId);
    if (!currentUser) {
      return res.status(404).json({ message: "User not found" });
    }

    // If password change is requested
    if (newPassword) {
      if (!currentPassword) {
        return res.status(400).json({ message: "Current password is required to change password" });
      }

      // Verify current password
      const isValidCurrentPassword = await bcrypt.compare(currentPassword, currentUser.passwordHash);
      if (!isValidCurrentPassword) {
        return res.status(401).json({ message: "Current password is incorrect" });
      }

      // Validate new password
      if (newPassword.length < 8) {
        return res.status(400).json({ message: "New password must be at least 8 characters long" });
      }

      // Hash new password
      const newPasswordHash = await bcrypt.hash(newPassword, 10);

      // Update user profile with new password
      const updatedUser = await User.findByIdAndUpdate(
        userId,
        {
          firstName,
          lastName,
          email,
          phone,
          country,
          passwordHash: newPasswordHash,
        },
        { new: true, runValidators: true }
      );

      return res.json({
        user: {
          id: updatedUser._id,
          firstName: updatedUser.firstName,
          lastName: updatedUser.lastName,
          email: updatedUser.email,
          phone: updatedUser.phone,
          country: updatedUser.country,
          profilePicture: updatedUser.profilePicture,
          createdAt: updatedUser.createdAt,
          updatedAt: updatedUser.updatedAt,
        },
        message: "Profile and password updated successfully"
      });
    } else {
      // Update user profile without password change
      const updatedUser = await User.findByIdAndUpdate(
        userId,
        {
          firstName,
          lastName,
          email,
          phone,
          country,
        },
        { new: true, runValidators: true }
      );

      return res.json({
        user: {
          id: updatedUser._id,
          firstName: updatedUser.firstName,
          lastName: updatedUser.lastName,
          email: updatedUser.email,
          phone: updatedUser.phone,
          country: updatedUser.country,
          profilePicture: updatedUser.profilePicture,
          createdAt: updatedUser.createdAt,
          updatedAt: updatedUser.updatedAt,
        },
        message: "Profile updated successfully"
      });
    }
  } catch (err) {
    next(err);
  }
};

// Upload profile picture
export const uploadProfilePicture = async (req, res, next) => {
  try {
    console.log('Profile picture upload request received');
    console.log('File:', req.file);
    console.log('User:', req.user);

    if (!req.file) {
      return res.status(400).json({ message: "No image file provided" });
    }

    const userId = req.user._id;
    console.log('User ID:', userId);

    // Upload image to ImgBB
    const filename = `profile_${userId}_${Date.now()}`;
    console.log('Uploading to ImgBB with filename:', filename);
    
    const uploadResult = await uploadToImgBB(req.file.buffer, filename);
    console.log('ImgBB upload result:', uploadResult);

    // Get current user to check if they have an existing profile picture
    const currentUser = await User.findById(userId);
    if (!currentUser) {
      return res.status(404).json({ message: "User not found" });
    }

    // Update user with new profile picture
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      {
        profilePicture: {
          url: uploadResult.url,
          deleteUrl: uploadResult.deleteUrl,
          id: uploadResult.id,
        }
      },
      { new: true, runValidators: true }
    );

    console.log('User updated successfully');

    return res.json({
      user: {
        id: updatedUser._id,
        firstName: updatedUser.firstName,
        lastName: updatedUser.lastName,
        email: updatedUser.email,
        phone: updatedUser.phone,
        country: updatedUser.country,
        profilePicture: updatedUser.profilePicture,
        createdAt: updatedUser.createdAt,
        updatedAt: updatedUser.updatedAt,
      },
      message: "Profile picture uploaded successfully"
    });
  } catch (err) {
    console.error('Error in uploadProfilePicture:', err);
    next(err);
  }
};


