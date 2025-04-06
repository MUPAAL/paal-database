require('dotenv').config();
const mongoose = require('mongoose');

// Connect to MongoDB
const DATABASE_HOST = process.env.DATABASE_HOST;
const DATABASE_PORT = process.env.DATABASE_PORT;
const DATABASE_DB = process.env.MONGO_INITDB_DATABASE;
const DATABASE_USERNAME = process.env.MONGO_INITDB_ROOT_USERNAME;
const DATABASE_PASSWORD = process.env.MONGO_INITDB_ROOT_PASSWORD;

// Try different connection strings
let URI = `mongodb://${DATABASE_USERNAME}:${DATABASE_PASSWORD}@mongo:${DATABASE_PORT}/${DATABASE_DB}?replicaSet=rs0&authSource=admin`;

// Log connection details
console.log('Attempting to connect with URI:', URI.replace(/:([^:@]+)@/, ':****@'));
console.log('DATABASE_HOST:', DATABASE_HOST);
console.log('DATABASE_PORT:', DATABASE_PORT);
console.log('DATABASE_DB:', DATABASE_DB);

async function createTestUser() {
  try {
    console.log('Connecting to MongoDB...');
    try {
      await mongoose.connect(URI);
    } catch (connectionError) {
      console.error('First connection attempt failed:', connectionError.message);

      // Try alternative connection string
      console.log('Trying alternative connection string...');
      URI = `mongodb://${DATABASE_USERNAME}:${DATABASE_PASSWORD}@${DATABASE_HOST}:${DATABASE_PORT}/${DATABASE_DB}?authSource=admin`;
      console.log('Alternative URI:', URI.replace(/:([^:@]+)@/, ':****@'));

      await mongoose.connect(URI);
    }
    console.log('Connected to MongoDB');

    // Create a simple User schema without password hashing
    const UserSchema = new mongoose.Schema({
      email: {
        type: String,
        required: true,
        unique: true,
        index: true,
        trim: true,
        lowercase: true
      },
      password: {
        type: String,
        required: true
      },
      firstName: { type: String, required: true },
      lastName: { type: String, required: true },
      role: {
        type: String,
        enum: ['admin', 'farmer'],
        default: 'farmer',
        index: true
      },
      assignedFarm: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Farm',
        default: null
      },
      isActive: {
        type: Boolean,
        default: true,
        index: true
      },
      lastLogin: { type: Date },
      profileImageUrl: { type: String }
    }, {
      timestamps: true
    });

    const TestUser = mongoose.model('User', UserSchema);

    // Create test users with plain text passwords
    const users = [
      {
        email: 'admin@test.com',
        password: 'admin123',
        firstName: 'Admin',
        lastName: 'User',
        role: 'admin',
        isActive: true
      },
      {
        email: 'farmer@test.com',
        password: 'farmer123',
        firstName: 'Farmer',
        lastName: 'User',
        role: 'farmer',
        isActive: true
      }
    ];

    for (const userData of users) {
      // Check if user already exists
      const existingUser = await TestUser.findOne({ email: userData.email });

      if (existingUser) {
        console.log(`User ${userData.email} already exists, updating password...`);
        existingUser.password = userData.password;
        await existingUser.save();
        console.log(`Updated password for ${userData.email}`);
      } else {
        console.log(`Creating user ${userData.email}...`);
        const newUser = new TestUser(userData);
        await newUser.save();
        console.log(`Created user ${userData.email}`);
      }
    }

    console.log('Test users created successfully');

  } catch (error) {
    console.error('Error creating test users:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

createTestUser();
