import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import User from '../models/User.js';
import Staff from '../models/Staff.js';
import dotenv from 'dotenv';

dotenv.config();

const createAdminUser = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/wildlife-safari');
    console.log('Connected to MongoDB');

    // Check if admin already exists
  const existingAdmin = await User.findOne({ email: 'admin@wildlanka.com' });
    if (existingAdmin) {
      console.log('Admin user already exists');
      return;
    }

    // Create admin user
    const passwordHash = await bcrypt.hash('admin123', 10);
    
    const adminUser = await User.create({
      firstName: 'Admin',
      lastName: 'User',
  email: 'admin@wildlanka.com',
      phone: '+1234567890',
      country: 'Sri Lanka',
      passwordHash,
      role: 'admin'
    });

    console.log('Admin user created successfully:', adminUser.email);
    console.log('Password: admin123');

    // Create staff record for admin
    await Staff.create({
      userId: adminUser._id,
      position: 'admin',
      department: 'management',
      employeeId: 'ADM001',
      permissions: ['manage_users', 'manage_bookings', 'manage_packages', 'view_reports', 'manage_staff']
    });

    console.log('Admin staff record created successfully');

  } catch (error) {
    console.error('Error creating admin user:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
};

createAdminUser();
