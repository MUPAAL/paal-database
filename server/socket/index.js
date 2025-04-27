const { Server } = require('socket.io');
const { CORS_CONFIG } = require('../config');
const { setupSocketEvents } = require('./events');
const { setupStatsEmitter } = require('./stats');

// Store the io instance
let io;

/**
 * Initialize Socket.IO server
 * @param {http.Server} httpServer - HTTP server instance
 * @returns {SocketIO.Server} Socket.IO server instance
 */
const initializeSocketIO = (httpServer) => {
  io = new Server(httpServer, {
    cors: CORS_CONFIG
  });

  // Set up socket event handlers
  setupSocketEvents(io);

  // Set up periodic stats emission
  setupStatsEmitter(io);

  return io;
};

/**
 * Get the Socket.IO instance
 * @returns {SocketIO.Server} Socket.IO server instance
 */
const getIO = () => {
  if (!io) {
    throw new Error('Socket.IO not initialized');
  }
  return io;
};

module.exports = {
  initializeSocketIO,
  getIO
};
