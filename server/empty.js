require('dotenv').config();
const mongoose = require('mongoose');

const DATABASE_HOST = process.env.DATABASE_HOST;
const DATABASE_PORT = process.env.DATABASE_PORT;
const DATABASE_DB = process.env.MONGO_INITDB_DATABASE;
const DATABASE_USERNAME = process.env.MONGO_INITDB_ROOT_USERNAME;
const DATABASE_PASSWORD = process.env.MONGO_INITDB_ROOT_PASSWORD;

const URI = `mongodb://${DATABASE_USERNAME}:${DATABASE_PASSWORD}@mongo:${DATABASE_PORT}/${DATABASE_DB}?replicaSet=rs0&authSource=admin`;

// Models
const Farm = require('./models/Farm');
const Barn = require('./models/Barn');
const Stall = require('./models/Stall');
const Pig = require('./models/Pig');
const PigHealthStatus = require('./models/PigHealthStatus');
const PigFertility = require('./models/PigFertility');
const PigHeatStatus = require('./models/PigHeatStatus');
const PigPosture = require('./models/PostureData');
const PigBCS = require('./models/PigBCS');
const PigVulvaSwelling = require('./models/PigVulvaSwelling');
const PigBreathRate = require('./models/PigBreathRate');
const Device = require('./models/Device');
const DeviceData = require('./models/TemperatureData');

function getRandomItem(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}
function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
function getRandomFloat(min, max, decimals = 1) {
  const scale = Math.pow(10, decimals);
  return Math.round((Math.random() * (max - min) + min) * scale) / scale;
}
function getDailyTimestamps(days = 30) {
  const timestamps = [];
  const now = Date.now();
  const oneDay = 24 * 60 * 60 * 1000;
  for (let i = days - 1; i >= 0; i--) {
    timestamps.push(new Date(now - i * oneDay));
  }
  return timestamps;
}

async function emptyDatabase() {
  try {
    await mongoose.connect(URI);
    console.log('✅ Connected to MongoDB');

    // 🔥 Clean up corrupted index
    try {
      await mongoose.connection.db.dropCollection('pigs');
      console.log('🧹 Dropped existing pigs collection');
    } catch (_) {
      console.log('ℹ️ No existing pigs collection to drop');
    }

    // Clean DB
    await Promise.all([
      Farm.deleteMany({}),
      Barn.deleteMany({}),
      Stall.deleteMany({}),
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

} catch (error) {
    console.error('🔥 Error seeding database:', error);
    process.exit(1);
  }
}

emptyDatabase();

