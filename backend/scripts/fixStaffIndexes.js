import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const fixStaffIndexes = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/wildlife-safari');
    console.log('Connected to MongoDB');

    // Get the Staff collection
    const db = mongoose.connection.db;
    const staffCollection = db.collection('staffs');

    // List all indexes
    console.log('Current indexes on staffs collection:');
    const indexes = await staffCollection.indexes();
    indexes.forEach(index => {
      console.log('Index:', index);
    });

    // Drop any problematic indexes (like employeeId)
    try {
      await staffCollection.dropIndex('employeeId_1');
      console.log('✅ Dropped employeeId_1 index');
    } catch (error) {
      console.log('employeeId_1 index not found or already dropped');
    }

    // Create proper indexes
    await staffCollection.createIndex({ email: 1 }, { unique: true });
    console.log('✅ Created email unique index');

    console.log('Staff indexes fixed successfully!');

  } catch (error) {
    console.error('Error fixing staff indexes:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
};

fixStaffIndexes();
