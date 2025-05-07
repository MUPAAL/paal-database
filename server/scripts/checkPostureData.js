// Script to check posture data for a specific pig within a date range
const mongoose = require('mongoose');
const PigPosture = require('../models/PostureData');
require('dotenv').config();

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/pig-monitoring')
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection error:', err));

// Function to check posture data for a pig within a date range
async function checkPostureData(pigId, startDateStr, endDateStr) {
  try {
    // Parse dates
    const startDate = new Date(startDateStr);
    startDate.setHours(0, 0, 0, 0);
    
    const endDate = new Date(endDateStr);
    endDate.setHours(23, 59, 59, 999);
    
    console.log(`Checking posture data for pig ${pigId} from ${startDate.toISOString()} to ${endDate.toISOString()}`);
    
    // Build query
    const query = { 
      pigId: parseInt(pigId),
      timestamp: {
        $gte: startDate,
        $lte: endDate
      }
    };
    
    console.log('Query:', JSON.stringify(query));
    
    // Find data
    const data = await PigPosture.find(query).sort({ timestamp: 1 });
    
    console.log(`Found ${data.length} records`);
    
    if (data.length > 0) {
      // Group by date
      const groupedByDate = {};
      
      data.forEach(record => {
        const dateStr = record.timestamp.toISOString().split('T')[0];
        if (!groupedByDate[dateStr]) {
          groupedByDate[dateStr] = [];
        }
        groupedByDate[dateStr].push(record);
      });
      
      console.log(`Data grouped into ${Object.keys(groupedByDate).length} days:`);
      
      // Print summary for each day
      for (const dateStr of Object.keys(groupedByDate).sort()) {
        console.log(`- ${dateStr}: ${groupedByDate[dateStr].length} records`);
      }
      
      // Print a few sample records
      console.log('\nSample records:');
      for (let i = 0; i < Math.min(5, data.length); i++) {
        console.log(`- ${data[i].timestamp.toISOString()}: score=${data[i].score}`);
      }
    } else {
      console.log('No data found for the specified date range');
    }
    
    // Check if there's any data for this pig at all
    const allData = await PigPosture.find({ pigId: parseInt(pigId) }).sort({ timestamp: 1 });
    
    if (allData.length > 0) {
      const firstDate = allData[0].timestamp.toISOString().split('T')[0];
      const lastDate = allData[allData.length - 1].timestamp.toISOString().split('T')[0];
      
      console.log(`\nThis pig has ${allData.length} records in total, from ${firstDate} to ${lastDate}`);
    } else {
      console.log('\nThis pig has no posture data at all');
    }
    
  } catch (error) {
    console.error('Error checking posture data:', error);
  } finally {
    // Disconnect from MongoDB
    await mongoose.disconnect();
    console.log('MongoDB disconnected');
  }
}

// Get command line arguments
const args = process.argv.slice(2);
if (args.length < 3) {
  console.log('Usage: node checkPostureData.js <pigId> <startDate> <endDate>');
  console.log('Example: node checkPostureData.js 129 2022-07-21 2022-08-02');
  process.exit(1);
}

const [pigId, startDate, endDate] = args;

// Run the check
checkPostureData(pigId, startDate, endDate);
