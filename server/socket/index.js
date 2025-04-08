const { Server } = require('socket.io');
const { CORS_CONFIG } = require('../config');
const { setupSocketEvents } = require('./events');
const { setupStatsEmitter } = require('./stats');

/**
 * Initialize Socket.IO server
 * @param {http.Server} httpServer - HTTP server instance
 * @returns {SocketIO.Server} Socket.IO server instance
 */
const initializeSocketIO = (httpServer) => {
  const io = new Server(httpServer, {
    cors: CORS_CONFIG
  });

  // Set up socket event handlers
  setupSocketEvents(io);
  
  // Set up periodic stats emission
  setupStatsEmitter(io);
  
  return io;
};

module.exports = {
  initializeSocketIO
};
