require('dotenv').config();
const mongoose = require('mongoose');
const { MongoClient, ObjectId } = require('mongodb');

// Models
const Farm = require('../models/Farm');
const Barn = require('../models/Barn');
const Stall = require('../models/Stall');
const Pig = require('../models/Pig');
const PigHealthStatus = require('../models/PigHealthStatus');
const PigFertility = require('../models/PigFertility');
const PigHeatStatus = require('../models/PigHeatStatus');
const PigPosture = require('../models/PostureData');
const PigBCS = require('../models/PigBCS');
const PigVulvaSwelling = require('../models/PigVulvaSwelling');
const PigBreathRate = require('../models/PigBreathRate');
const Device = require('../models/Device');
const DeviceData = require('../models/TemperatureData');
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

// Test MongoDB connection
async function testMongoConnection() {
  console.log('\n🔍 TESTING MONGODB CONNECTION');
  console.log('============================');
  console.log('Environment variables:');
  console.log('DATABASE_HOST:', DATABASE_HOST);
  console.log('DATABASE_PORT:', DATABASE_PORT);
  console.log('DATABASE_DB:', DATABASE_DB);
  console.log('DATABASE_USERNAME:', DATABASE_USERNAME ? '[SET]' : '[NOT SET]');
  console.log('DATABASE_PASSWORD:', DATABASE_PASSWORD ? '[SET]' : '[NOT SET]');
  console.log('URI:', uri.replace(/:([^:@]+)@/, ':****@'));

  try {
    console.log('\nConnecting to MongoDB...');
    await mongoose.connect(uri);
    console.log('✅ MongoDB connection successful!');

    // Get connection status
    const status = mongoose.connection.readyState;
    console.log(`Connection status: ${status === 1 ? 'Connected' : 'Not connected'}`);

    return true;
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    return false;
  }
}

// Create users with specific IDs
async function createUsers() {
  console.log('\n👤 CREATING USERS');
  console.log('================');

  try {
    // Admin user
    const adminExists = await User.findOne({ email: 'admin@test.com' });

    if (!adminExists) {
      console.log('Creating admin user with ID:', ADMIN_ID);
      const admin = new User({
        _id: new mongoose.Types.ObjectId(ADMIN_ID),
        email: 'admin@test.com',
        password: 'admin123', // This will be hashed by the pre-save hook
        firstName: 'Admin',
        lastName: 'User',
        role: 'admin',
        isActive: true,
        lastLogin: new Date()
      });
      await admin.save();
      console.log('✅ Admin user created successfully');
    } else {
      if (adminExists._id.toString() !== ADMIN_ID) {
        console.log('⚠️ Admin user exists but with different ID:', adminExists._id);
        console.log('Deleting existing admin user and creating new one with correct ID');
        await User.deleteOne({ email: 'admin@test.com' });

        const admin = new User({
          _id: new mongoose.Types.ObjectId(ADMIN_ID),
          email: 'admin@test.com',
          password: 'admin123', // This will be hashed by the pre-save hook
          firstName: 'Admin',
          lastName: 'User',
          role: 'admin',
          isActive: true,
          lastLogin: new Date()
        });
        await admin.save();
        console.log('✅ Admin user recreated with correct ID');
      } else {
        console.log('✅ Admin user already exists with correct ID');
        // Update other fields
        adminExists.firstName = 'Admin';
        adminExists.lastName = 'User';
        adminExists.role = 'admin';
        adminExists.isActive = true;
        adminExists.lastLogin = new Date();
        await adminExists.save();
        console.log('✅ Admin user updated');
      }
    }

    // Get first farm for farmer assignment
    let firstFarm = await Farm.findOne();
    if (!firstFarm) {
      console.log('No farms found. Creating a default farm...');
      firstFarm = await Farm.create({
        name: 'Default Farm',
        location: 'Default Location',
        description: 'Default farm created for farmer assignment',
        isActive: true
      });
      console.log('✅ Default farm created');
    }

    // Farmer user
    const farmerExists = await User.findOne({ email: 'farmer@test.com' });

    if (!farmerExists) {
      console.log('Creating farmer user with ID:', FARMER_ID);
      const farmer = new User({
        _id: new mongoose.Types.ObjectId(FARMER_ID),
        email: 'farmer@test.com',
        password: 'farmer123', // This will be hashed by the pre-save hook
        firstName: 'Farmer',
        lastName: 'User',
        role: 'farmer',
        assignedFarm: firstFarm._id,
        isActive: true,
        lastLogin: new Date()
      });
      await farmer.save();
      console.log('✅ Farmer user created successfully');
    } else {
      if (farmerExists._id.toString() !== FARMER_ID) {
        console.log('⚠️ Farmer user exists but with different ID:', farmerExists._id);
        console.log('Deleting existing farmer user and creating new one with correct ID');
        await User.deleteOne({ email: 'farmer@test.com' });

        const farmer = new User({
          _id: new mongoose.Types.ObjectId(FARMER_ID),
          email: 'farmer@test.com',
          password: 'farmer123', // This will be hashed by the pre-save hook
          firstName: 'Farmer',
          lastName: 'User',
          role: 'farmer',
          assignedFarm: firstFarm._id,
          isActive: true,
          lastLogin: new Date()
        });
        await farmer.save();
        console.log('✅ Farmer user recreated with correct ID');
      } else {
        console.log('✅ Farmer user already exists with correct ID');
        // Update other fields
        farmerExists.firstName = 'Farmer';
        farmerExists.lastName = 'User';
        farmerExists.role = 'farmer';
        farmerExists.assignedFarm = firstFarm._id;
        farmerExists.isActive = true;
        farmerExists.lastLogin = new Date();
        await farmerExists.save();
        console.log('✅ Farmer user updated');
      }
    }

    // List all users
    const users = await User.find();
    console.log('\nUsers in database:');
    users.forEach(user => {
      console.log(`- ${user.email} (${user.role}) [ID: ${user._id}]`);
    });

    return true;
  } catch (error) {
    console.error('❌ Error creating users:', error);
    return false;
  }
}

// Seed farms, barns, stalls, pigs, and devices
async function seedData() {
  console.log('\n🌱 SEEDING DATABASE');
  console.log('==================');

  try {
    // Clean DB (except users)
    console.log('Cleaning database...');
    await Promise.all([
      Farm.deleteMany({}),
      Barn.deleteMany({}),
      Stall.deleteMany({}),
      Pig.deleteMany({}),
      PigHealthStatus.deleteMany({}),
      PigFertility.deleteMany({}),
      PigHeatStatus.deleteMany({}),
      PigPosture.deleteMany({}),
      PigBCS.deleteMany({}),
      PigVulvaSwelling.deleteMany({}),
      PigBreathRate.deleteMany({}),
      Device.deleteMany({}),
      DeviceData.deleteMany({})
    ]);
    console.log('✅ Database cleaned');

    // Create farms
    console.log('Creating farms...');
    const farms = [];
    for (let i = 1; i <= 2; i++) {
      const farm = await Farm.create({
        name: `Farm ${i}`,
        location: `Location ${i}`,
        description: `Description for Farm ${i}`,
        isActive: true
      });
      farms.push(farm);
      console.log(`✅ Created Farm ${i}`);
    }

    // Create barns
    console.log('Creating barns...');
    const barns = [];
    for (const farm of farms) {
      for (let i = 1; i <= 3; i++) {
        const barn = await Barn.create({
          name: `Barn ${i} (${farm.name})`,
          farmId: farm._id
        });
        barns.push(barn);
        console.log(`✅ Created Barn ${i} for ${farm.name}`);
      }
    }

    // Create stalls
    console.log('Creating stalls...');
    const stalls = [];
    for (const barn of barns) {
      for (let i = 1; i <= 5; i++) {
        const stall = await Stall.create({
          name: `Stall ${i} (${barn.name})`,
          barnId: barn._id,
          farmId: barn.farmId
        });
        stalls.push(stall);
        console.log(`✅ Created Stall ${i} for ${barn.name}`);
      }
    }

    // Create pigs
    console.log('Creating pigs...');
    const pigs = [];
    const healthStatuses = ['healthy', 'at risk', 'critical', 'no movement'];
    const breeds = ['Duroc', 'Hampshire', 'Yorkshire', 'Berkshire', 'Landrace'];

    for (let i = 1; i <= 50; i++) {
      // Randomly assign to a stall
      const stall = stalls[Math.floor(Math.random() * stalls.length)];

      const pig = await Pig.create({
        pigId: i,
        tag: `TAG-${i.toString().padStart(4, '0')}`,
        breed: breeds[Math.floor(Math.random() * breeds.length)],
        age: Math.floor(Math.random() * 5) + 1,
        currentLocation: {
          stallId: stall._id,
          barnId: stall.barnId,
          farmId: stall.farmId
        },
        active: true
      });
      pigs.push(pig);
      console.log(`✅ Created Pig ${i}`);

      // Create health status
      await PigHealthStatus.create({
        pigId: pig.pigId, // Use the numeric pigId, not the ObjectId
        status: healthStatuses[Math.floor(Math.random() * healthStatuses.length)],
        timestamp: new Date()
      });
    }

    // Create devices
    console.log('Creating devices...');
    const devices = [];
    const deviceTypes = ['Temperature', 'Humidity', 'Motion', 'Sound'];
    const deviceStatuses = ['online', 'offline', 'warning'];

    for (let i = 1; i <= 5; i++) {
      // Randomly assign to a farm
      const farm = farms[Math.floor(Math.random() * farms.length)];

      const device = await Device.create({
        deviceId: i,
        deviceName: `Device ${i}`,
        deviceType: deviceTypes[Math.floor(Math.random() * deviceTypes.length)],
        status: deviceStatuses[Math.floor(Math.random() * deviceStatuses.length)],
        farmId: farm._id
      });
      devices.push(device);
      console.log(`✅ Created Device ${i}`);

      // Create temperature data (just a few points to avoid long processing)
      const now = new Date();
      for (let j = 0; j < 3; j++) {
        const timestamp = new Date(now);
        timestamp.setHours(now.getHours() - j);

        await DeviceData.create({
          recordId: i * 100 + j, // Create a unique recordId
          deviceId: device.deviceId, // Use the numeric deviceId, not the ObjectId
          timestamp,
          temperature: 20 + Math.random() * 10
        });
      }
    }

    // Update farmer user to have the first farm
    const farmer = await User.findOne({ email: 'farmer@test.com' });
    if (farmer) {
      farmer.assignedFarm = farms[0]._id;
      await farmer.save();
      console.log(`✅ Updated farmer user to be assigned to ${farms[0].name}`);
    }

    console.log('\n🎉 Database seeded successfully!');
    console.log(`
      Created:
        - ${farms.length} Farms
        - ${barns.length} Barns
        - ${stalls.length} Stalls
        - ${pigs.length} Pigs
        - ${devices.length} Devices (with temperature data)
    `);

    return true;
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    return false;
  }
}

// Main function
async function main() {
  console.log('🚀 STARTING DATABASE SETUP');
  console.log('=========================');

  try {
    // Test connection
    const connectionSuccess = await testMongoConnection();
    if (!connectionSuccess) {
      console.error('❌ Failed to connect to MongoDB. Aborting.');
      process.exit(1);
    }

    // Create users
    const usersSuccess = await createUsers();
    if (!usersSuccess) {
      console.error('❌ Failed to create users. Aborting.');
      process.exit(1);
    }

    // Seed data
    const seedSuccess = await seedData();
    if (!seedSuccess) {
      console.error('❌ Failed to seed database. Aborting.');
      process.exit(1);
    }

    console.log('\n✨ ALL DONE! Database is ready to use.');

    // Close connection
    await mongoose.connection.close();
    console.log('Disconnected from MongoDB');

    process.exit(0);
  } catch (error) {
    console.error('❌ Unexpected error:', error);
    process.exit(1);
  }
}

// Run the main function
main();
