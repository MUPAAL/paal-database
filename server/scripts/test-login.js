require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// Connect to MongoDB
const DATABASE_HOST = process.env.DATABASE_HOST;
const DATABASE_PORT = process.env.DATABASE_PORT;
const DATABASE_DB = process.env.MONGO_INITDB_DATABASE;
const DATABASE_USERNAME = process.env.MONGO_INITDB_ROOT_USERNAME;
const DATABASE_PASSWORD = process.env.MONGO_INITDB_ROOT_PASSWORD;

const URI = `mongodb://${DATABASE_USERNAME}:${DATABASE_PASSWORD}@mongo:${DATABASE_PORT}/${DATABASE_DB}?replicaSet=rs0&authSource=admin`;

async function testLogin() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(URI);
    console.log('Connected to MongoDB');

    // Load User model
    const User = require('../models/User');

    // Create test user
    const testEmail = 'test@example.com';
    const testPassword = 'password123';

    // Check if test user already exists
    let testUser = await User.findOne({ email: testEmail });
    
    if (!testUser) {
      console.log('Creating test user...');
      testUser = new User({
        email: testEmail,
        password: testPassword,
        firstName: 'Test',
        lastName: 'User',
        role: 'admin',
        isActive: true
      });

      await testUser.save();
      console.log('Test user created successfully');
    } else {
      console.log('Test user already exists');
    }

    // Test login
    console.log('Testing login...');
    const isMatch = await testUser.comparePassword(testPassword);
    console.log('Password match:', isMatch);

    if (isMatch) {
      console.log('Login successful!');
    } else {
      console.log('Login failed!');
    }

  } catch (error) {
    console.error('Error testing login:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

testLogin();
