const mongoose = require('mongoose');

/**
 * Register all models
 */
const registerModels = () => {
  // Define all models to register
  const models = [
    '../models/Pig',
    '../models/PigBCS',
    '../models/PostureData',
    '../models/PigHeatStatus',
    '../models/PigHealthStatus',
    '../models/PigVulvaSwelling',
    '../models/PigBreathRate',
    '../models/Device',
    '../models/TemperatureData',
    '../models/Farm',
    '../models/Barn',
    '../models/Stall',
    '../models/User'
  ];

  // Register each model
  models.forEach(modelPath => {
    try {
      require(modelPath);
    } catch (error) {
      console.error(`Error loading model from ${modelPath}:`, error);
    }
  });

  console.log(`Registered ${models.length} models successfully`);
};

/**
 * Set up change streams for models that need real-time updates
 * @param {Function} emitUpdatedStats - Function to emit updated stats
 */
const setupChangeStreams = (emitUpdatedStats) => {
  const Pig = mongoose.model('Pig');
  const pigChangeStream = Pig.watch([], { fullDocument: 'updateLookup' });
  pigChangeStream.on('change', async () => {
    await emitUpdatedStats();
  });

  const Device = mongoose.model('Device');
  const deviceChangeStream = Device.watch([], { fullDocument: 'updateLookup' });
  deviceChangeStream.on('change', async () => {
    await emitUpdatedStats();
  });
};

module.exports = {
  registerModels,
  setupChangeStreams
};
