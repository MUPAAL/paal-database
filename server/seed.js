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

async function seedDatabase() {
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

    const farms = [];
    for (let i = 1; i <= 2; i++) {
      const farm = await Farm.create({ name: `Farm ${i}`, location: `Location ${i}` });
      farms.push(farm);
    }

    const barns = [];
    for (let farm of farms) {
      for (let j = 1; j <= 3; j++) {
        const barn = await Barn.create({ name: `Barn ${j}`, farmId: farm._id });
        barns.push(barn);
      }
    }

    const stalls = [];
    for (let barn of barns) {
      for (let k = 1; k <= 5; k++) {
        const stall = await Stall.create({ name: `Stall ${k}`, barnId: barn._id, farmId: barn.farmId });
        stalls.push(stall);
      }
    }

    const pigBreeds = ['Yorkshire', 'Landrace', 'Duroc', 'Berkshire', 'Hampshire', 'Chester White', 'Tamworth'];
    let globalPigId = 1;
    const pigs = [];

    for (let stall of stalls) {
      const pigCount = getRandomInt(4, 6);
      for (let i = 0; i < pigCount; i++) {
        const pigId = globalPigId++;
        try {
          const pig = await Pig.create({
            pigId,
            tag: `Tag-${pigId}`,
            currentLocation: {
              stallId: stall._id,
              barnId: stall.barnId,
              farmId: stall.farmId
            },
            lastUpdate: new Date(),
            breed: getRandomItem(pigBreeds),
            age: getRandomInt(1, 36),
            active: true
          });
          console.log(`🐷 Created pig ${pigId}`);
          pigs.push(pig);
        } catch (err) {
          console.error(`💥 Failed to create pig ${pigId}:`, err.message);
          throw err;
        }
      }
    }

    const timestamps = getDailyTimestamps(30);
    const statuses = {
      health: ['at risk', 'healthy', 'critical', 'no movement'],
      fertility: ['in heat', 'Pre-Heat', 'Open', 'ready to breed'],
      heat: ['open', 'bred', 'pregnant', 'farrowing', 'weaning'],
      vulva: ['low', 'moderate', 'high']
    };

    for (let pig of pigs) {
      const pigId = pig._id;
      await PigHealthStatus.insertMany(timestamps.map(ts => ({ pigId, timestamp: ts, status: getRandomItem(statuses.health) })));
      await PigFertility.insertMany(timestamps.map(ts => ({ pigId, timestamp: ts, status: getRandomItem(statuses.fertility) })));
      await PigHeatStatus.insertMany(timestamps.map(ts => ({ pigId, timestamp: ts, status: getRandomItem(statuses.heat) })));
      await PigPosture.insertMany(timestamps.map(ts => ({ pigId, timestamp: ts, score: getRandomInt(1, 5) })));
      await PigBCS.insertMany(timestamps.map(ts => ({ pigId, timestamp: ts, score: getRandomFloat(2, 4, 1) })));
      await PigVulvaSwelling.insertMany(timestamps.map(ts => ({ pigId, timestamp: ts, value: getRandomItem(statuses.vulva) })));
      await PigBreathRate.insertMany(timestamps.map(ts => ({ pigId, timestamp: ts, rate: getRandomInt(15, 30) })));
    }

    const deviceStatus = ['online', 'offline', 'warning'];
    const devices = [];
    for (let i = 1; i <= 10; i++) {
      const device = await Device.create({
        deviceId: i,
        deviceName: `Sensor-${i}`,
        deviceType: 'Temperature',
        status: getRandomItem(deviceStatus),
        temperature: getRandomFloat(20, 30, 1)
      });
      devices.push(device);
    }

    let recordId = 1;
    for (let device of devices) {
      await DeviceData.insertMany(timestamps.map(ts => ({
        recordId: recordId++,
        deviceId: device.deviceId,
        timestamp: ts,
        temperature: getRandomFloat(20, 30, 1)
      })));
    }

    console.log('\n🎉 Database seeded successfully!');
    console.log(`
      Created:
        - ${farms.length} Farms
        - ${barns.length} Barns
        - ${stalls.length} Stalls
        - ${pigs.length} Pigs
        - ${devices.length} Devices (w/ temp data)
    `);

    process.exit(0);
  } catch (error) {
    console.error('🔥 Error seeding database:', error);
    process.exit(1);
  }
}

seedDatabase();
