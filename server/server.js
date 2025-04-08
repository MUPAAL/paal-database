const express = require('express');
const { createServer } = require('http');
// Force port 5005 to match nginx configuration
const SERVER_PORT = 5005;
const { connectToDatabase } = require('./db/connection');
const { setupChangeStreams } = require('./db/models');
const { setupMiddleware } = require('./middleware');
const { registerRoutes } = require('./routes');
const { initializeSocketIO } = require('./socket');

/**
 * Initialize and start the server
 */
async function startServer() {
  try {
    // Create Express app
    const app = express();

    // Create HTTP server
    const httpServer = createServer(app);

    // Set up middleware
    setupMiddleware(app);

    // Register routes
    registerRoutes(app);

    // Initialize Socket.IO
    const io = initializeSocketIO(httpServer);

    // Connect to database
    await connectToDatabase();

    // Set up change streams for real-time updates
    const { emitUpdatedStats } = require('./socket/stats');
    setupChangeStreams(() => emitUpdatedStats(io));

    // Start the server
    httpServer.listen(5005, () => {
      console.log(`Server running on port ${SERVER_PORT}`);
    });

  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

// Start the server
startServer();
