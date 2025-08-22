import mongoose from 'mongoose';
import Attendance from '../models/Attendance.js';
import Staff from '../models/Staff.js';
import User from '../models/User.js';

// Connect to MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect('mongodb://localhost:27017/wildlife-safari');
    console.log('MongoDB connected successfully');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};

// Create test attendance data
const createTestAttendance = async () => {
  try {
    // First, create a test user if it doesn't exist
    let testUser = await User.findOne({ email: 'admin@test.com' });
    if (!testUser) {
      testUser = new User({
        firstName: 'Test',
        lastName: 'Admin',
        email: 'admin@test.com',
        passwordHash: 'test123',
        role: 'admin'
      });
      await testUser.save();
      console.log('Test user created');
    }

    // Get or create test staff members
    let driver = await Staff.findOne({ email: 'driver@test.com' });
    if (!driver) {
      driver = new Staff({
        firstName: 'John',
        lastName: 'Driver',
        email: 'driver@test.com',
        passwordHash: 'test123',
        phone: '1234567890',
        role: 'driver',
        basicSalary: 45000,
        createdBy: testUser._id
      });
      await driver.save();
      console.log('Test driver created');
    }

    let tourGuide = await Staff.findOne({ email: 'guide@test.com' });
    if (!tourGuide) {
      tourGuide = new Staff({
        firstName: 'Sarah',
        lastName: 'Guide',
        email: 'guide@test.com',
        passwordHash: 'test123',
        phone: '0987654321',
        role: 'tour_guide',
        basicSalary: 55000,
        createdBy: testUser._id
      });
      await tourGuide.save();
      console.log('Test tour guide created');
    }

    // Create test attendance records for current month
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth();
    const currentYear = currentDate.getFullYear();

    // Clear existing test attendance records
    await Attendance.deleteMany({
      staffId: { $in: [driver._id, tourGuide._id] },
      date: {
        $gte: new Date(currentYear, currentMonth, 1),
        $lte: new Date(currentYear, currentMonth + 1, 0)
      }
    });

    // Create attendance records for the current month
    const attendanceRecords = [];

    // Generate records for each working day (Monday to Friday) in the current month
    for (let day = 1; day <= 31; day++) {
      const date = new Date(currentYear, currentMonth, day);
      
      // Skip weekends (Saturday = 6, Sunday = 0)
      if (date.getDay() === 0 || date.getDay() === 6) continue;
      
      // Skip future dates
      if (date > currentDate) continue;

      // Driver attendance
      const driverCheckIn = new Date(date);
      driverCheckIn.setHours(8, 0, 0, 0); // 8:00 AM
      
      const driverCheckOut = new Date(date);
      driverCheckOut.setHours(17, 0, 0, 0); // 5:00 PM
      
      const driverAttendance = new Attendance({
        staffId: driver._id,
        date: date,
        status: 'present',
        checkIn: {
          time: driverCheckIn,
          location: 'Main Office'
        },
        checkOut: {
          time: driverCheckOut,
          location: 'Main Office'
        },
        totalHours: 9, // 9 hours
        notes: 'Regular working day'
      });
      attendanceRecords.push(driverAttendance);

      // Tour Guide attendance
      const guideCheckIn = new Date(date);
      guideCheckIn.setHours(9, 0, 0, 0); // 9:00 AM
      
      const guideCheckOut = new Date(date);
      guideCheckOut.setHours(18, 0, 0, 0); // 6:00 PM
      
      const guideAttendance = new Attendance({
        staffId: tourGuide._id,
        date: date,
        status: 'present',
        checkIn: {
          time: guideCheckIn,
          location: 'Tour Center'
        },
        checkOut: {
          time: guideCheckOut,
          location: 'Tour Center'
        },
        totalHours: 9, // 9 hours
        notes: 'Regular working day'
      });
      attendanceRecords.push(guideAttendance);
    }

    // Save all attendance records
    await Attendance.insertMany(attendanceRecords);
    
    console.log(`Created ${attendanceRecords.length} test attendance records`);
    console.log('Test data includes:');
    console.log('- Driver: John Driver (Salary: $45,000)');
    console.log('- Tour Guide: Sarah Guide (Salary: $55,000)');
    console.log('- Working days: Monday to Friday');
    console.log('- Working hours: 9 hours per day');
    console.log('- Month: Current month');
    
    // Show sample records
    const sampleRecords = await Attendance.find({
      staffId: { $in: [driver._id, tourGuide._id] }
    }).populate('staffId', 'firstName lastName').limit(5);
    
    console.log('\nSample attendance records:');
    sampleRecords.forEach(record => {
      console.log(`- ${record.staffId.firstName} ${record.staffId.lastName}: ${record.date.toDateString()}, ${record.totalHours} hours`);
    });

  } catch (error) {
    console.error('Error creating test attendance:', error);
  }
};

// Main execution
const main = async () => {
  await connectDB();
  await createTestAttendance();
  console.log('\nTest data creation completed!');
  process.exit(0);
};

main().catch(console.error);
