// Script to generate realistic posture data for testing
const mongoose = require('mongoose');
const PigPosture = require('../models/PostureData');
const Pig = require('../models/Pig');
require('dotenv').config();

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/pig-monitoring')
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection error:', err));

// Function to generate posture data for a pig
async function generatePostureData(pigId, startDate, endDate, recordsPerDay = 48) {
  try {
    // Check if pig exists
    const pig = await Pig.findOne({ pigId });
    if (!pig) {
      console.error(`Pig with ID ${pigId} not found`);
      return;
    }

    console.log(`Generating posture data for pig ${pigId} from ${startDate.toISOString().split('T')[0]} to ${endDate.toISOString().split('T')[0]}`);

    // Delete existing posture data for this pig
    await PigPosture.deleteMany({ pigId });
    console.log(`Deleted existing posture data for pig ${pigId}`);

    // Generate data for each day
    const postureData = [];
    const currentDate = new Date(startDate);
    
    while (currentDate <= endDate) {
      // Generate realistic posture patterns for this day
      // Pigs tend to have patterns in their behavior
      
      // Morning pattern (mostly standing/moving)
      const morningPattern = [1, 4]; // Standing and Moving
      
      // Midday pattern (mostly lying/sitting)
      const middayPattern = [2, 3]; // Lying and Sitting
      
      // Evening pattern (mixed)
      const eveningPattern = [1, 2, 3, 4, 5]; // All behaviors
      
      // Generate records throughout the day
      for (let i = 0; i < recordsPerDay; i++) {
        const hour = Math.floor(i * 24 / recordsPerDay);
        const minute = Math.floor(Math.random() * 60);
        
        const timestamp = new Date(currentDate);
        timestamp.setHours(hour, minute, 0, 0);
        
        // Select pattern based on time of day
        let pattern;
        if (hour < 8) {
          pattern = morningPattern;
        } else if (hour < 16) {
          pattern = middayPattern;
        } else {
          pattern = eveningPattern;
        }
        
        // Select a score from the pattern with some randomness
        const randomIndex = Math.floor(Math.random() * pattern.length);
        const score = pattern[randomIndex];
        
        postureData.push({
          pigId,
          timestamp,
          score
        });
      }
      
      // Move to next day
      currentDate.setDate(currentDate.getDate() + 1);
    }
    
    // Insert all data
    await PigPosture.insertMany(postureData);
    console.log(`Generated ${postureData.length} posture records for pig ${pigId}`);
    
    return postureData.length;
  } catch (error) {
    console.error('Error generating posture data:', error);
    throw error;
  }
}

// Main function
async function main() {
  try {
    // Get all pigs
    const pigs = await Pig.find({});
    console.log(`Found ${pigs.length} pigs`);
    
    if (pigs.length === 0) {
      console.log('No pigs found. Please create some pigs first.');
      process.exit(1);
    }
    
    // Generate data for each pig
    const startDate = new Date('2022-07-21');
    const endDate = new Date('2022-08-25');
    
    let totalRecords = 0;
    
    for (const pig of pigs) {
      const recordsGenerated = await generatePostureData(pig.pigId, startDate, endDate);
      totalRecords += recordsGenerated;
    }
    
    console.log(`Generated a total of ${totalRecords} posture records for ${pigs.length} pigs`);
    
    // Disconnect from MongoDB
    await mongoose.disconnect();
    console.log('MongoDB disconnected');
    
    process.exit(0);
  } catch (error) {
    console.error('Error in main function:', error);
    process.exit(1);
  }
}

// Run the main function
main();
