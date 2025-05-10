const mongoose = require('mongoose');
const { DATABASE_CONFIG } = require('../config');
const { registerModels } = require('./models');

/**
 * Connect to MongoDB and register models
 * @returns {Promise} Resolves when connection is established
 */
const connectToDatabase = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(DATABASE_CONFIG.uri);
    console.log('MongoDB Connected');

    // Register all models after connection
    registerModels();

    return mongoose.connection;
  } catch (err) {
    console.error('MongoDB Connection Error:', err);
    throw err;
  }
};

module.exports = {
  connectToDatabase
};
