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

async function seedAdmin() {
  try {
    await mongoose.connect(URI);
    console.log('Connected to MongoDB');

    // Load User model
    const User = require('../models/User');

    // Check if admin user already exists
    const existingAdmin = await User.findOne({ email: 'admin@paal.com' });
    
    if (existingAdmin) {
      console.log('Admin user already exists');
      return;
    }

    // Create admin user
    const adminUser = new User({
      email: 'admin@paal.com',
      password: 'admin123', // Will be hashed by pre-save hook
      firstName: 'Admin',
      lastName: 'User',
      role: 'admin',
      isActive: true
    });

    await adminUser.save();
    console.log('Admin user created successfully');

    // Create a farmer user
    const farmerUser = new User({
      email: 'farmer@paal.com',
      password: 'farmer123', // Will be hashed by pre-save hook
      firstName: 'Farmer',
      lastName: 'User',
      role: 'farmer',
      isActive: true
    });

    await farmerUser.save();
    console.log('Farmer user created successfully');

  } catch (error) {
    console.error('Error seeding admin user:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

seedAdmin();
