const express = require('express');
const cors = require('cors');

/**
 * Configure Express middleware
 * @param {Express} app - Express application
 */
const setupMiddleware = (app) => {
  // Enable CORS
  app.use(cors());
  
  // Parse JSON request bodies
  app.use(express.json());
  
  // Trust proxy - needed for express-rate-limit behind a proxy
  app.set('trust proxy', 1);
};

module.exports = {
  setupMiddleware
};
