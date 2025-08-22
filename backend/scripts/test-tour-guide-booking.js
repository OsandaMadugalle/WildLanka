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
    console.log('🚀 Creating test data for tour guide booking system...');

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
      description: 'A test safari package for tour guide testing',
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

    // Create a test tour guide
    const testGuide = new Staff({
      firstName: 'Test',
      lastName: 'Guide',
      email: 'testguide@example.com',
      passwordHash: 'testpassword',
      phone: '+94 71 987 6543',
      role: 'tour_guide',
      specialization: 'Wildlife Photography',
      experience: 8,
      licenseNumber: 'TG123456',
      isActive: true,
      basicSalary: 70000,
      createdBy: testUser._id
    });
    await testGuide.save();
    console.log('✅ Test tour guide created:', testGuide.email);

    // Create a test booking with payment confirmed status (available for guide)
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

    // Create another test booking that's already assigned to the guide
    const assignedBooking = new Booking({
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
        startDate: new Date('2024-02-20'),
        endDate: new Date('2024-02-21'),
        numberOfPeople: 3,
        specialRequests: 'Assigned tour request',
        emergencyContact: '+94 71 222 2222',
        dietaryRestrictions: 'Vegetarian',
        accommodationPreference: 'Luxury',
        transportationPreference: 'Private Vehicle'
      },
      totalPrice: 45000,
      status: 'Guide Assigned',
      guideId: testGuide._id,
      guideAccepted: true,
      guideAcceptedAt: new Date(),
      paymentMethod: 'Stripe',
      payment: true,
      stripeSessionId: 'test_session_456',
      stripePaymentIntentId: 'test_payment_456'
    });
    await assignedBooking.save();
    console.log('✅ Test assigned booking created');

    // Create a completed tour
    const completedBooking = new Booking({
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
        startDate: new Date('2024-02-10'),
        endDate: new Date('2024-02-11'),
        numberOfPeople: 4,
        specialRequests: 'Completed tour request',
        emergencyContact: '+94 71 333 3333',
        dietaryRestrictions: 'None',
        accommodationPreference: 'Standard',
        transportationPreference: 'Included'
      },
      totalPrice: 60000,
      status: 'Completed',
      guideId: testGuide._id,
      guideAccepted: true,
      guideAcceptedAt: new Date('2024-02-09'),
      paymentMethod: 'Stripe',
      payment: true,
      stripeSessionId: 'test_session_789',
      stripePaymentIntentId: 'test_payment_789'
    });
    await completedBooking.save();
    console.log('✅ Test completed booking created');

    // Create additional completed tours for chart demonstration
    const additionalCompletedTours = [
      {
        startDate: new Date('2024-01-15'),
        endDate: new Date('2024-01-16'),
        numberOfPeople: 2,
        completionDate: new Date('2024-01-16'),
        specialRequests: 'January tour'
      },
      {
        startDate: new Date('2024-01-20'),
        endDate: new Date('2024-01-21'),
        numberOfPeople: 3,
        completionDate: new Date('2024-01-21'),
        specialRequests: 'January tour 2'
      },
      {
        startDate: new Date('2024-02-05'),
        endDate: new Date('2024-02-06'),
        numberOfPeople: 5,
        completionDate: new Date('2024-02-06'),
        specialRequests: 'February tour 1'
      },
      {
        startDate: new Date('2024-02-12'),
        endDate: new Date('2024-02-13'),
        numberOfPeople: 2,
        completionDate: new Date('2024-02-13'),
        specialRequests: 'February tour 2'
      }
    ];

    for (let i = 0; i < additionalCompletedTours.length; i++) {
      const tourData = additionalCompletedTours[i];
      const additionalBooking = new Booking({
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
          startDate: tourData.startDate,
          endDate: tourData.endDate,
          numberOfPeople: tourData.numberOfPeople,
          specialRequests: tourData.specialRequests,
          emergencyContact: `+94 71 ${400 + i} ${400 + i} ${400 + i}`,
          dietaryRestrictions: 'None',
          accommodationPreference: 'Standard',
          transportationPreference: 'Included'
        },
        totalPrice: 30000 * tourData.numberOfPeople,
        status: 'Completed',
        guideId: testGuide._id,
        guideAccepted: true,
        guideAcceptedAt: new Date(tourData.startDate.getTime() - 24 * 60 * 60 * 1000), // Day before start
        paymentMethod: 'Stripe',
        payment: true,
        stripeSessionId: `test_session_${800 + i}`,
        stripePaymentIntentId: `test_payment_${800 + i}`,
        updatedAt: tourData.completionDate // Set completion date
      });
      await additionalBooking.save();
      console.log(`✅ Additional completed booking ${i + 1} created`);
    }

    console.log('\n📊 Test Data Summary:');
    console.log('- Test User:', testUser.email);
    console.log('- Test Package:', testPackage.title);
    console.log('- Test Tour Guide:', testGuide.email);
    console.log('- Available Booking (Payment Confirmed):', testBooking._id);
    console.log('- Assigned Booking (Guide Assigned):', assignedBooking._id);
    console.log('- Completed Booking (Completed):', completedBooking._id);

    console.log('\n🎯 Next Steps:');
    console.log('1. Start the backend server: npm start');
    console.log('2. Test the tour guide endpoints with the test guide credentials');
    console.log('3. Use the test guide ID for testing:');
    console.log('   - Available bookings: GET /api/bookings/guide/available');
    console.log('   - Accepted bookings: GET /api/bookings/guide/accepted');
    console.log('   - Completed bookings: GET /api/bookings/guide/completed');

  } catch (error) {
    console.error('❌ Error creating test data:', error);
  }
};

const cleanupTestData = async () => {
  try {
    console.log('🧹 Cleaning up test data...');
    
    // Remove test bookings
    await Booking.deleteMany({
      stripeSessionId: { 
        $in: [
          'test_session_123', 
          'test_session_456', 
          'test_session_789',
          'test_session_800',
          'test_session_801',
          'test_session_802',
          'test_session_803'
        ] 
      }
    });
    console.log('✅ Test bookings cleaned up');

    // Remove test package
    await Package.deleteMany({ title: 'Test Safari Package' });
    console.log('✅ Test package cleaned up');

    // Remove test staff
    await Staff.deleteMany({ email: 'testguide@example.com' });
    console.log('✅ Test tour guide cleaned up');

    // Remove test user
    await User.deleteMany({ email: 'testcustomer@example.com' });
    console.log('✅ Test user cleaned up');

    console.log('✅ All test data cleaned up successfully');
  } catch (error) {
    console.error('❌ Error cleaning up test data:', error);
  }
};

const main = async () => {
  try {
    await connectDB();
    
    const command = process.argv[2];
    
    if (command === 'cleanup') {
      await cleanupTestData();
    } else {
      await createTestData();
    }
    
    console.log('\n✅ Script completed successfully');
    process.exit(0);
  } catch (error) {
    console.error('❌ Script failed:', error);
    process.exit(1);
  }
};

main();
