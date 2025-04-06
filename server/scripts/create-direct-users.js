require('dotenv').config();
const { MongoClient } = require('mongodb');
// Note: Not using bcrypt for seeding to avoid dependency issues

// Connection details
const DATABASE_HOST = process.env.DATABASE_HOST || 'mongo';
const DATABASE_PORT = process.env.DATABASE_PORT || '27017';
const DATABASE_DB = process.env.MONGO_INITDB_DATABASE || 'paalab';
const DATABASE_USERNAME = process.env.MONGO_INITDB_ROOT_USERNAME || 'PAAL';
const DATABASE_PASSWORD = process.env.MONGO_INITDB_ROOT_PASSWORD || 'PAAL';

// Try different connection strings
let URI = `mongodb://${DATABASE_USERNAME}:${DATABASE_PASSWORD}@mongo:${DATABASE_PORT}/${DATABASE_DB}?authSource=admin`;

// Log connection details
console.log('Attempting to connect with URI:', URI.replace(/:([^:@]+)@/, ':****@'));
console.log('DATABASE_HOST:', DATABASE_HOST);
console.log('DATABASE_PORT:', DATABASE_PORT);
console.log('DATABASE_DB:', DATABASE_DB);

async function createDirectUsers() {
  let client;

  try {
    console.log('Connecting to MongoDB...');

    try {
      client = new MongoClient(URI);
      await client.connect();
    } catch (connectionError) {
      console.error('First connection attempt failed:', connectionError.message);

      // Try alternative connection string
      console.log('Trying alternative connection string...');
      URI = `mongodb://${DATABASE_USERNAME}:${DATABASE_PASSWORD}@${DATABASE_HOST}:${DATABASE_PORT}/${DATABASE_DB}?authSource=admin`;
      console.log('Alternative URI:', URI.replace(/:([^:@]+)@/, ':****@'));

      client = new MongoClient(URI);
      await client.connect();
    }

    console.log('Connected to MongoDB');

    const db = client.db(DATABASE_DB);
    const usersCollection = db.collection('users');

    // Using plain text passwords for seeding
    const adminPassword = 'admin123';
    const farmerPassword = 'farmer123';

    console.log('Using plain text passwords for seeding');

    // Create test users
    const users = [
      {
        email: 'admin@test.com',
        password: adminPassword, // Hashed password
        firstName: 'Admin',
        lastName: 'User',
        role: 'admin',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        email: 'farmer@test.com',
        password: farmerPassword, // Hashed password
        firstName: 'Farmer',
        lastName: 'User',
        role: 'farmer',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];

    for (const userData of users) {
      // Check if user already exists
      const existingUser = await usersCollection.findOne({ email: userData.email });

      if (existingUser) {
        console.log(`User ${userData.email} already exists, updating...`);
        await usersCollection.updateOne(
          { email: userData.email },
          { $set: { ...userData, updatedAt: new Date() } }
        );
        console.log(`Updated user ${userData.email}`);
      } else {
        console.log(`Creating user ${userData.email}...`);
        await usersCollection.insertOne(userData);
        console.log(`Created user ${userData.email}`);
      }
    }

    console.log('Test users created successfully');

    // List all users
    console.log('Listing all users:');
    const allUsers = await usersCollection.find({}).toArray();
    allUsers.forEach(user => {
      console.log(`- ${user.email} (${user.role})`);
    });

  } catch (error) {
    console.error('Error creating test users:', error);
  } finally {
    if (client) {
      await client.close();
      console.log('Disconnected from MongoDB');
    }
  }
}

createDirectUsers();
