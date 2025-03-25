require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const { createServer } = require('http');
const { Server } = require('socket.io');

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: "*",
    methods: ["GET", "POST", "DELETE", "PUT"],
  }
});


const port = 5005;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/farms', require('./routes/farm'));
app.use('/api/barns', require('./routes/barn'));
app.use('/api/stalls', require('./routes/stall'));
app.use('/api/devices', require('./routes/devices'));
app.use('/api/pigs', require('./routes/pig'));
app.use('/api/temperature', require('./routes/temperatureData'));
app.use('/api/stats', require('./routes/stats'));
app.use('/api/upload/postureupload', require('./routes/upload/postureUpload'));
app.use('/api/systemmanagement', require('./routes/system-management/management'));

// Database Connection
const DATABASE_HOST = process.env.DATABASE_HOST;
const DATABASE_PORT = process.env.DATABASE_PORT;
const DATABASE_DB = process.env.MONGO_INITDB_DATABASE;
const DATABASE_USERNAME = process.env.MONGO_INITDB_ROOT_USERNAME;
const DATABASE_PASSWORD = process.env.MONGO_INITDB_ROOT_PASSWORD;

const URI = `mongodb://${DATABASE_USERNAME}:${DATABASE_PASSWORD}@mongo:${DATABASE_PORT}/${DATABASE_DB}?replicaSet=rs0&authSource=admin`;

mongoose.connect(URI)
  .then(() => {
    console.log('MongoDB Connected');

    // Register all models after connection
    require('./models/Pig');
    require('./models/PigBCS');
    require('./models/PostureData');
    require('./models/PigHeatStatus');
    require('./models/PigHealthStatus');
    require('./models/PigVulvaSwelling');
    require('./models/PigBreathRate');
    require('./models/Device'); 
    require('./models/TemperatureData'); 
    require('./models/Farm');
    require('./models/Barn');
    require('./models/Stall');

    // Set up change streams after models are registered
    const Pig = mongoose.model('Pig');
    const pigChangeStream = Pig.watch([], { fullDocument: 'updateLookup' });
    pigChangeStream.on('change', async (change) => {
      await emitUpdatedStats();
    });

    const Device = mongoose.model('Device');
    const deviceChangeStream = Device.watch([], { fullDocument: 'updateLookup' });
    deviceChangeStream.on('change', async (change) => {
      await emitUpdatedStats();
    });
  })
  .catch(err => console.error('MongoDB Connection Error:', err));

// Socket.IO Event Handlers
io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);
  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

// Function to Emit Updated Stats
const emitUpdatedStats = async () => {
  try {
    // Get all required models
    const Device = mongoose.model('Device');
    const PigBCS = mongoose.model('PigBCS');
    const PostureData = mongoose.model('PigPosture');
    const TemperatureData = mongoose.model('TemperatureData');
    const Pig = mongoose.model('Pig');
    const PigHealthStatus = mongoose.model('PigHealthStatus');
    const PigFertility = require('./models/PigFertility');
    const PigHeatStatus = mongoose.model('PigHeatStatus');
    const Barn = mongoose.model('Barn');
    const pigFertilityData = require('./models/PigFertility'); 
    const Stall = mongoose.model('Stall');

    // Get device stats
    const devices = await Device.find({});
    const onlineDevices = devices.filter(d => d.status === 'online').length;
    const totalDevices = devices.length;
    const deviceUsage = totalDevices > 0 ? Math.round((onlineDevices / totalDevices) * 100) : 0;

    // Get latest temperature readings
    const latestTemps = await TemperatureData.find({})
      .sort({ timestamp: -1 })
      .limit(devices.length);
    const avgTemp = latestTemps.length > 0 
      ? latestTemps.reduce((acc, curr) => acc + curr.temperature, 0) / latestTemps.length 
      : 0;

    // BCS distribution using PigBCS
    const bcsData = await PigBCS.find({}).sort({ timestamp: -1 });
    const avgBCS = bcsData.length > 0 
      ? bcsData.reduce((acc, curr) => acc + curr.score, 0) / bcsData.length 
      : 0;

    // Posture distribution
    const postureData = await PostureData.find({}).sort({ timestamp: -1 });
    const postureCounts = postureData.reduce((acc, curr) => {
      acc[curr.score] = (acc[curr.score] || 0) + 1;
      return acc;
    }, {});
    const totalPostures = postureData.length;
    const postureDistribution = Object.entries(postureCounts).map(([score, count]) => ({
      score: Number(score),
      count,
      percentage: totalPostures > 0 ? Math.round((count / totalPostures) * 100) : 0
    }));

    // Get all pigs
    const pigs = await Pig.find({}).sort({ lastUpdate: -1 });

    // Pig Health Status aggregation
    const pigHealthAggregated = await PigHealthStatus.aggregate([
      { $sort: { timestamp: -1 } },
      { $group: { _id: "$pigId", status: { $first: "$status" } } },
      { $group: { _id: "$status", count: { $sum: 1 } } }
    ]);

    // Initialize health stats with all possible statuses
    const pigHealthStats = {
      'at risk': 0,
      'healthy': 0,
      'critical': 0,
      'no movement': 0
    };

    // Update health stats from aggregation
    pigHealthAggregated.forEach(item => {
      if (pigHealthStats.hasOwnProperty(item._id)) {
        pigHealthStats[item._id] = item.count;
      }
    });

    // Pig Heat Status aggregation
    const pigHeatStatusAggregated = await PigHeatStatus.aggregate([
      { $sort: { timestamp: -1 } },
      { $group: { _id: "$pigId", status: { $first: "$status" } } },
      { $group: { _id: "$status", count: { $sum: 1 } } }
    ]);

    // Initialize heat stats with all possible statuses
    const pigHeatStats = {
      'open': 0,
      'bred': 0,
      'pregnant': 0,
      'farrowing': 0,
      'weaning': 0
    };

    // Update heat stats from aggregation
    pigHeatStatusAggregated.forEach(item => {
      if (pigHeatStats.hasOwnProperty(item._id)) {
        pigHeatStats[item._id] = item.count;
      }
    });
    const pigFertilityAggregated = await PigFertility.aggregate([
      { $sort: { timestamp: -1 } },
      { $group: { _id: "$pigId", status: { $first: "$status" } } },
      { $group: { _id: "$status", count: { $sum: 1 } } }
    ]);

    const fertilityStats = pigFertilityAggregated.reduce((acc, curr) => {
      acc[curr._id.toLowerCase().replace(/\s+/g, '')] = curr.count;
      return acc;
    }, {});
    // Pig Fertility aggregation

    const barns = await Barn.find({});
    const stalls = await Stall.find({});

    // Barn Stats
    const barnStats = barns.reduce((acc, barn) => {
      const pigsInBarn = pigs.filter(p => p.currentLocation?.barnId?.toString() === barn._id.toString()).length;
      acc[barn.name] = pigsInBarn;
      return acc;
    }, {});

    // Stall Stats
    const stallStats = barns.reduce((barnAcc, barn) => {
      const stallsInBarn = stalls.filter(stall => stall.barnId?.toString() === barn._id.toString());
      const stallSummary = stallsInBarn.reduce((stallAcc, stall) => {
        const pigsInStall = pigs.filter(p => p.currentLocation?.stallId?.toString() === stall._id.toString()).length;
        stallAcc[stall.name] = pigsInStall;
        return stallAcc;
      }, {});
      barnAcc[barn.name] = stallSummary;
      return barnAcc;
    }, {});

    // Transform pigs for UI
    const transformedPigs = pigs.map(pig => ({
      owner: `PIG-${pig.pigId.toString().padStart(3, '0')}`,
      status: pig.bcsScore >= 4 ? "critical" : pig.bcsScore >= 3 ? "healthy" : "suspicious",
      costs: pig.age,
      region: pig.currentLocation.stallId,
      stability: pig.stability,
      lastEdited: pig.lastUpdate
        ? new Date(pig.lastUpdate).toLocaleDateString('en-GB', {
            day: '2-digit', month: '2-digit', year: 'numeric',
            hour: '2-digit', minute: '2-digit'
          })
        : new Date().toLocaleDateString('en-GB', {
            day: '2-digit', month: '2-digit', year: 'numeric',
            hour: '2-digit', minute: '2-digit'
          }),
      breed: pig.breed,
      healthStatus: pigHealthAggregated.find(status => status._id === pig._id.toString())?.status,
      heatStatus: pigHeatStatusAggregated.find(status => status._id === pig._id.toString())?.status
    }));

    // Transform devices for UI
    const transformedDevices = devices.map(device => ({
      id: device.deviceId,
      created: device.insertionTime || new Date().toISOString(),
      deviceName: device.deviceName,
      type: device.deviceType,
      status: device.status,
      priority: device.status === 'online'
        ? 'low'
        : device.status === 'warning'
          ? 'medium'
          : 'high',
      lastDataPoint: device.lastUpdate
        ? new Date(device.lastUpdate).toISOString()
        : new Date().toISOString()
    }));

    // Emit aggregated stats
    io.emit('stats_update', {
      deviceStats: {
        onlineDevices,
        totalDevices,
        deviceUsage,
        averageTemperature: Number(avgTemp.toFixed(1))
      },
      bcsStats: {
        averageBCS: Number(avgBCS.toFixed(1))
      },
      postureDistribution,
      pigStats: {
        totalPigs: pigs.length,
      },
      pigHeatStats: {
        totalOpen: pigHeatStats['open'],
        totalBred: pigHeatStats['bred'],
        totalPregnant: pigHeatStats['pregnant'],
        totalFarrowing: pigHeatStats['farrowing'],
        totalWeaning: pigHeatStats['weaning']
      },
      barnStats,
      stallStats,
      pigHealthStats: {
        totalAtRisk: pigHealthStats['at risk'],
        totalHealthy: pigHealthStats['healthy'],
        totalCritical: pigHealthStats['critical'],
        totalNoMovement: pigHealthStats['no movement']
      },
      pigFertilityStats: {
        InHeat: fertilityStats['in-heat'] || 0,
        PreHeat: fertilityStats['pre-heat'] || 0,
        Open: fertilityStats['open'] || 0,
        ReadyToBreed: fertilityStats['ready-to-breed'] || 0,
      }
    });

    // Emit lists for devices and pigs
    io.emit('devices_update', transformedDevices);
    io.emit('pigs_update', transformedPigs);

  } catch (error) {
    console.error('Error emitting updates:', error);
  }
};

// Periodically Emit Stats
setInterval(emitUpdatedStats, 5000);

httpServer.listen(port, () => {
  console.log(`Server running on port ${port}`);
});