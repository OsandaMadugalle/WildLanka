import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Booking from '../models/Booking.js';
import Package from '../models/Package.js';
import User from '../models/User.js';
import Staff from '../models/Staff.js';

dotenv.config();

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ MongoDB connected successfully');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  }
};

const createTestData = async () => {
  try {
    console.log('🚀 Creating test data for driver booking system...');

    // Create a test user
    const testUser = new User({
      firstName: 'Test',
      lastName: 'Customer',
      email: 'testcustomer@example.com',
      passwordHash: 'testpassword',
      phone: '+94 71 123 4567',
      role: 'user'
    });
    await testUser.save();
    console.log('✅ Test user created:', testUser.email);

    // Create a test package
    const testPackage = new Package({
      title: 'Test Safari Package',
      description: 'A test safari package for driver booking testing',
      duration: '2 Days',
      location: 'Yala National Park',
      category: 'Wildlife Safari',
      price: 15000,
      maxGroupSize: 6,
      image: 'test-image.jpg',
      highlights: ['Wildlife viewing', 'Bird watching'],
      itinerary: ['Day 1: Arrival and safari', 'Day 2: Morning safari and departure'],
      included: ['Accommodation', 'Meals', 'Transportation'],
      notIncluded: ['Personal expenses', 'Tips'],
      createdBy: testUser._id
    });
    await testPackage.save();
    console.log('✅ Test package created:', testPackage.title);

    // Create a test driver
    const testDriver = new Staff({
      firstName: 'Test',
      lastName: 'Driver',
      email: 'testdriver@example.com',
      passwordHash: 'testpassword',
      phone: '+94 71 987 6543',
      role: 'driver',
      specialization: 'Safari Driver',
      experience: 5,
      licenseNumber: 'DRV123456',
      isActive: true,
      basicSalary: 60000,
      createdBy: testUser._id
    });
    await testDriver.save();
    console.log('✅ Test driver created:', testDriver.email);

    // Create a test booking with payment confirmed status
    const testBooking = new Booking({
      userId: testUser._id,
      packageId: testPackage._id,
      packageDetails: {
        title: testPackage.title,
        duration: testPackage.duration,
        location: testPackage.location,
        category: testPackage.category,
        basePrice: testPackage.price
      },
      bookingDetails: {
        startDate: new Date('2024-02-15'),
        endDate: new Date('2024-02-16'),
        numberOfPeople: 2,
        specialRequests: 'Test special request',
        emergencyContact: '+94 71 111 1111',
        dietaryRestrictions: 'None',
        accommodationPreference: 'Standard',
        transportationPreference: 'Included'
      },
      totalPrice: 30000,
      status: 'Payment Confirmed',
      paymentMethod: 'Stripe',
      payment: true,
      stripeSessionId: 'test_session_123',
      stripePaymentIntentId: 'test_payment_123'
    });
    await testBooking.save();
    console.log('✅ Test booking created with Payment Confirmed status');

    console.log('\n📊 Test Data Summary:');
    console.log('User:', testUser.email);
    console.log('Package:', testPackage.title);
    console.log('Driver:', testDriver.email);
    console.log('Booking ID:', testBooking._id);
    console.log('Booking Status:', testBooking.status);

    console.log('\n🔍 To test the driver booking system:');
    console.log('1. Login as the test driver (testdriver@example.com)');
    console.log('2. Go to the driver dashboard');
    console.log('3. You should see the test booking in "Available Bookings"');
    console.log('4. Click "Accept" to assign the booking to the driver');
    console.log('5. The booking should move to "My Accepted Bookings"');

    return {
      user: testUser,
      package: testPackage,
      driver: testDriver,
      booking: testBooking
    };

  } catch (error) {
    console.error('❌ Error creating test data:', error);
    throw error;
  }
};

const cleanupTestData = async () => {
  try {
    console.log('🧹 Cleaning up test data...');
    
    // Delete test data
    await User.deleteOne({ email: 'testcustomer@example.com' });
    await Package.deleteOne({ title: 'Test Safari Package' });
    await Staff.deleteOne({ email: 'testdriver@example.com' });
    await Booking.deleteOne({ stripeSessionId: 'test_session_123' });
    
    console.log('✅ Test data cleaned up successfully');
  } catch (error) {
    console.error('❌ Error cleaning up test data:', error);
  }
};

const main = async () => {
  try {
    await connectDB();
    
    // Check if cleanup flag is provided
    const shouldCleanup = process.argv.includes('--cleanup');
    
    if (shouldCleanup) {
      await cleanupTestData();
    } else {
      await createTestData();
    }
    
    console.log('\n✅ Test script completed successfully');
  } catch (error) {
    console.error('❌ Test script failed:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 MongoDB disconnected');
    process.exit(0);
  }
};

// Run the script
main();
