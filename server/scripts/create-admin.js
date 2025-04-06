require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');

// Connection details
const DATABASE_HOST = process.env.DATABASE_HOST || 'mongo';
const DATABASE_PORT = process.env.DATABASE_PORT || '27017';
const DATABASE_DB = process.env.MONGO_INITDB_DATABASE || 'paalab';
const DATABASE_USERNAME = process.env.MONGO_INITDB_ROOT_USERNAME || 'PAAL';
const DATABASE_PASSWORD = process.env.MONGO_INITDB_ROOT_PASSWORD || 'PAAL';

// MongoDB URI
const uri = `mongodb://${DATABASE_USERNAME}:${DATABASE_PASSWORD}@${DATABASE_HOST}:${DATABASE_PORT}/${DATABASE_DB}?authSource=admin`;

// User IDs
const ADMIN_ID = '67f1cac0399bf2dda1ea08a8';
const FARMER_ID = '67f1cac0399bf2dda1ea08a9';

async function createAdminUser() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(uri);
    console.log('Connected to MongoDB');

    // Check if admin user exists
    const adminExists = await User.findOne({ email: 'admin@test.com' });
    
    if (adminExists) {
      console.log('Admin user exists with ID:', adminExists._id);
      
      if (adminExists._id.toString() !== ADMIN_ID) {
        console.log('Deleting existing admin user');
        await User.deleteOne({ email: 'admin@test.com' });
        console.log('Creating new admin user with correct ID');
        
        const admin = new User({
          _id: new mongoose.Types.ObjectId(ADMIN_ID),
          email: 'admin@test.com',
          password: 'admin123',
          firstName: 'Admin',
          lastName: 'User',
          role: 'admin',
          isActive: true,
          lastLogin: new Date()
        });
        
        await admin.save();
        console.log('Admin user created with ID:', admin._id);
      } else {
        console.log('Admin user already has the correct ID');
      }
    } else {
      console.log('Creating admin user');
      
      const admin = new User({
        _id: new mongoose.Types.ObjectId(ADMIN_ID),
        email: 'admin@test.com',
        password: 'admin123',
        firstName: 'Admin',
        lastName: 'User',
        role: 'admin',
        isActive: true,
        lastLogin: new Date()
      });
      
      await admin.save();
      console.log('Admin user created with ID:', admin._id);
    }
    
    // List all users
    const users = await User.find();
    console.log('Users in database:');
    users.forEach(user => {
      console.log(`- ${user.email} (${user.role}) [ID: ${user._id}]`);
    });
    
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  } catch (error) {
    console.error('Error:', error);
    await mongoose.disconnect();
  }
}

createAdminUser();
