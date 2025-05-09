// Script to test date queries directly against the database
const mongoose = require('mongoose');
const PigPosture = require('../models/PostureData');
require('dotenv').config();

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/pig-monitoring')
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection error:', err));

// Function to test date queries
async function testDateQuery(pigId, startDateStr, endDateStr) {
  try {
    // Parse dates
    const startDate = new Date(startDateStr);
    startDate.setHours(0, 0, 0, 0);
    
    const endDate = new Date(endDateStr);
    endDate.setHours(23, 59, 59, 999);
    
    console.log(`Testing date query for pig ${pigId} from ${startDate.toISOString()} to ${endDate.toISOString()}`);
    
    // Build query
    const query = { 
      pigId: parseInt(pigId),
      timestamp: {
        $gte: startDate,
        $lte: endDate
      }
    };
    
    console.log('Query:', JSON.stringify(query, null, 2));
    
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
      
      // Try a broader query to see if there's any data at all
      const allData = await PigPosture.find({ pigId: parseInt(pigId) }).sort({ timestamp: 1 });
      
      if (allData.length > 0) {
        console.log(`\nThis pig has ${allData.length} records in total`);
        
        // Get the date range of all data
        const dates = allData.map(record => record.timestamp);
        const minDate = new Date(Math.min(...dates.map(d => d.getTime())));
        const maxDate = new Date(Math.max(...dates.map(d => d.getTime())));
        
        console.log(`Data spans from ${minDate.toISOString()} to ${maxDate.toISOString()}`);
        
        // Print a few sample records
        console.log('\nSample records:');
        for (let i = 0; i < Math.min(5, allData.length); i++) {
          console.log(`- ${allData[i].timestamp.toISOString()}: score=${allData[i].score}`);
        }
      } else {
        console.log('\nThis pig has no posture data at all');
      }
    }
    
    // Now try a direct query using the raw date strings
    console.log('\nTrying a direct query using the raw date strings:');
    
    // Find all records where the date part of the timestamp matches the date strings
    const pipeline = [
      { 
        $match: { 
          pigId: parseInt(pigId) 
        } 
      },
      { 
        $addFields: { 
          dateStr: { $dateToString: { format: "%Y-%m-%d", date: "$timestamp" } } 
        } 
      },
      { 
        $match: { 
          dateStr: { 
            $gte: startDateStr, 
            $lte: endDateStr 
          } 
        } 
      },
      { 
        $sort: { 
          timestamp: 1 
        } 
      }
    ];
    
    const aggregateData = await PigPosture.aggregate(pipeline);
    
    console.log(`Found ${aggregateData.length} records using date string matching`);
    
    if (aggregateData.length > 0) {
      // Print a few sample records
      console.log('\nSample records from aggregate query:');
      for (let i = 0; i < Math.min(5, aggregateData.length); i++) {
        console.log(`- ${aggregateData[i].timestamp.toISOString()}: score=${aggregateData[i].score}, dateStr=${aggregateData[i].dateStr}`);
      }
    }
    
  } catch (error) {
    console.error('Error testing date query:', error);
  } finally {
    // Disconnect from MongoDB
    await mongoose.disconnect();
    console.log('MongoDB disconnected');
  }
}

// Get command line arguments
const args = process.argv.slice(2);
if (args.length < 3) {
  console.log('Usage: node testDateQuery.js <pigId> <startDate> <endDate>');
  console.log('Example: node testDateQuery.js 129 2022-07-21 2022-08-02');
  process.exit(1);
}

const [pigId, startDate, endDate] = args;

// Run the test
testDateQuery(pigId, startDate, endDate);
