import mongoose from 'mongoose';
import Review from '../models/Review.js';
import Package from '../models/Package.js';

const populateReviewPackageTitles = async () => {
  try {
    console.log('Connecting to MongoDB...');
    
    // Connect to MongoDB (adjust connection string as needed)
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/wildlanka');
    
    console.log('Connected to MongoDB successfully');
    
    // Find all reviews that don't have packageTitle field
    const reviewsToUpdate = await Review.find({
      $or: [
        { packageTitle: { $exists: false } },
        { packageTitle: null },
        { packageTitle: '' }
      ]
    }).populate('packageId', 'title');
    
    console.log(`Found ${reviewsToUpdate.length} reviews to update`);
    
    let updatedCount = 0;
    let skippedCount = 0;
    
    for (const review of reviewsToUpdate) {
      try {
        if (review.packageId && review.packageId.title) {
          // Update the review with the package title
          await Review.findByIdAndUpdate(review._id, {
            packageTitle: review.packageId.title
          });
          updatedCount++;
          console.log(`Updated review ${review._id} with package title: "${review.packageId.title}"`);
        } else {
          // Package might be deleted, try to find it manually or skip
          console.log(`Skipping review ${review._id} - package not found or has no title`);
          skippedCount++;
        }
      } catch (updateError) {
        console.error(`Error updating review ${review._id}:`, updateError.message);
        skippedCount++;
      }
    }
    
    console.log('\nMigration completed!');
    console.log(`✅ Updated: ${updatedCount} reviews`);
    console.log(`⚠️  Skipped: ${skippedCount} reviews`);
    
  } catch (error) {
    console.error('Migration failed:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
};

// Run the migration
populateReviewPackageTitles();