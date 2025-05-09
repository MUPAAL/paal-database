// Test script to check if the activities API endpoint is working
const axios = require('axios');
const mongoose = require('mongoose');
require('dotenv').config();

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => {
  console.log('Connected to MongoDB');
  
  // Load the ActivityLog model
  require('./models/ActivityLog');
  const ActivityLog = mongoose.model('ActivityLog');
  
  // Create a test activity
  const createTestActivity = async () => {
    try {
      const activity = new ActivityLog({
        type: 'system',
        action: 'test',
        description: 'Test activity created by test script',
        metadata: { test: true }
      });
      
      await activity.save();
      console.log('Test activity created:', activity);
      
      // Get all activities
      const activities = await ActivityLog.find().sort({ createdAt: -1 }).limit(10);
      console.log('Recent activities:', activities);
      
      // Test the API endpoint
      try {
        const response = await axios.get('http://localhost:8080/api/activities');
        console.log('API response:', response.data);
      } catch (error) {
        console.error('API error:', error.message);
        if (error.response) {
          console.error('API error details:', error.response.data);
        }
      }
      
      // Disconnect from MongoDB
      await mongoose.disconnect();
      console.log('Disconnected from MongoDB');
    } catch (error) {
      console.error('Error:', error);
      await mongoose.disconnect();
    }
  };
  
  createTestActivity();
}).catch(error => {
  console.error('MongoDB connection error:', error);
});
