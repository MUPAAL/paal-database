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
    '../models/User',
    '../models/ActivityLog'
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
  const { logActivity } = require('../services/activityLogger');
  const { emitActivity } = require('../socket/events');

  // Get the socket.io instance safely
  let io;
  try {
    io = require('../socket').getIO();
  } catch (error) {
    console.warn('Socket.IO not initialized yet, activity events will not be emitted');
    io = null;
  }

  // Watch Pig model changes
  const Pig = mongoose.model('Pig');
  const pigChangeStream = Pig.watch([], { fullDocument: 'updateLookup' });
  pigChangeStream.on('change', async (change) => {
    await emitUpdatedStats();

    // Log the activity
    if (change.operationType === 'insert') {
      const activity = await logActivity({
        type: 'pig',
        action: 'created',
        description: `Pig #${change.fullDocument.pigId} was added to the system`,
        entityId: change.fullDocument._id,
        metadata: { pigId: change.fullDocument.pigId, tag: change.fullDocument.tag }
      });

      // Emit the activity to all connected clients
      emitActivity(io, activity);
    } else if (change.operationType === 'update') {
      const activity = await logActivity({
        type: 'pig',
        action: 'updated',
        description: `Pig #${change.fullDocument.pigId} was updated`,
        entityId: change.fullDocument._id,
        metadata: { pigId: change.fullDocument.pigId, tag: change.fullDocument.tag }
      });

      // Emit the activity to all connected clients
      emitActivity(io, activity);
    } else if (change.operationType === 'delete') {
      const activity = await logActivity({
        type: 'pig',
        action: 'deleted',
        description: `A pig was removed from the system`,
        entityId: change.documentKey._id
      });

      // Emit the activity to all connected clients
      emitActivity(io, activity);
    }
  });

  // Watch Device model changes
  const Device = mongoose.model('Device');
  const deviceChangeStream = Device.watch([], { fullDocument: 'updateLookup' });
  deviceChangeStream.on('change', async (change) => {
    await emitUpdatedStats();

    // Log the activity
    if (change.operationType === 'insert') {
      const activity = await logActivity({
        type: 'device',
        action: 'created',
        description: `Device #${change.fullDocument.deviceId} was added to the system`,
        entityId: change.fullDocument._id,
        metadata: { deviceId: change.fullDocument.deviceId, deviceName: change.fullDocument.deviceName }
      });

      // Emit the activity to all connected clients
      emitActivity(io, activity);
    } else if (change.operationType === 'update') {
      // Check if status changed
      if (change.updateDescription.updatedFields && change.updateDescription.updatedFields.status) {
        const activity = await logActivity({
          type: 'device',
          action: 'status_changed',
          description: `Device #${change.fullDocument.deviceId} status changed to ${change.fullDocument.status}`,
          entityId: change.fullDocument._id,
          metadata: {
            deviceId: change.fullDocument.deviceId,
            deviceName: change.fullDocument.deviceName,
            status: change.fullDocument.status
          }
        });

        // Emit the activity to all connected clients
        emitActivity(io, activity);
      } else {
        const activity = await logActivity({
          type: 'device',
          action: 'updated',
          description: `Device #${change.fullDocument.deviceId} was updated`,
          entityId: change.fullDocument._id,
          metadata: { deviceId: change.fullDocument.deviceId, deviceName: change.fullDocument.deviceName }
        });

        // Emit the activity to all connected clients
        emitActivity(io, activity);
      }
    } else if (change.operationType === 'delete') {
      const activity = await logActivity({
        type: 'device',
        action: 'deleted',
        description: `A device was removed from the system`,
        entityId: change.documentKey._id
      });

      // Emit the activity to all connected clients
      emitActivity(io, activity);
    }
  });

  // Watch Farm model changes
  const Farm = mongoose.model('Farm');
  const farmChangeStream = Farm.watch([], { fullDocument: 'updateLookup' });
  farmChangeStream.on('change', async (change) => {
    await emitUpdatedStats();

    // Log the activity
    if (change.operationType === 'insert') {
      const activity = await logActivity({
        type: 'farm',
        action: 'created',
        description: `Farm "${change.fullDocument.name}" was added to the system`,
        entityId: change.fullDocument._id,
        metadata: { name: change.fullDocument.name, location: change.fullDocument.location }
      });

      // Emit the activity to all connected clients
      emitActivity(io, activity);
    } else if (change.operationType === 'update') {
      const activity = await logActivity({
        type: 'farm',
        action: 'updated',
        description: `Farm "${change.fullDocument.name}" was updated`,
        entityId: change.fullDocument._id,
        metadata: { name: change.fullDocument.name, location: change.fullDocument.location }
      });

      // Emit the activity to all connected clients
      emitActivity(io, activity);
    }
  });

  // Watch User model changes
  const User = mongoose.model('User');
  const userChangeStream = User.watch([], { fullDocument: 'updateLookup' });
  userChangeStream.on('change', async (change) => {
    await emitUpdatedStats();

    // Log the activity
    if (change.operationType === 'insert') {
      const activity = await logActivity({
        type: 'user',
        action: 'created',
        description: `User "${change.fullDocument.email}" was added to the system`,
        entityId: change.fullDocument._id,
        metadata: {
          email: change.fullDocument.email,
          role: change.fullDocument.role,
          name: `${change.fullDocument.firstName} ${change.fullDocument.lastName}`
        }
      });

      // Emit the activity to all connected clients
      emitActivity(io, activity);
    } else if (change.operationType === 'update') {
      // Check if role changed
      if (change.updateDescription.updatedFields && change.updateDescription.updatedFields.role) {
        const activity = await logActivity({
          type: 'user',
          action: 'role_changed',
          description: `User "${change.fullDocument.email}" role changed to ${change.fullDocument.role}`,
          entityId: change.fullDocument._id,
          metadata: {
            email: change.fullDocument.email,
            role: change.fullDocument.role,
            name: `${change.fullDocument.firstName} ${change.fullDocument.lastName}`
          }
        });

        // Emit the activity to all connected clients
        emitActivity(io, activity);
      } else {
        const activity = await logActivity({
          type: 'user',
          action: 'updated',
          description: `User "${change.fullDocument.email}" was updated`,
          entityId: change.fullDocument._id,
          metadata: {
            email: change.fullDocument.email,
            role: change.fullDocument.role,
            name: `${change.fullDocument.firstName} ${change.fullDocument.lastName}`
          }
        });

        // Emit the activity to all connected clients
        emitActivity(io, activity);
      }
    }
  });
};

module.exports = {
  registerModels,
  setupChangeStreams
};
