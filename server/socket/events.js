const { getRecentActivities } = require('../services/activityLogger');

/**
 * Set up Socket.IO event handlers
 * @param {SocketIO.Server} io - Socket.IO server instance
 */
const setupSocketEvents = (io) => {
  io.on('connection', (socket) => {
    console.log('Client connected:', socket.id);

    // Send recent activities when a client connects
    sendRecentActivities(socket);

    // Handle client requesting recent activities
    socket.on('get_recent_activities', async (options = {}) => {
      await sendRecentActivities(socket, options);
    });

    socket.on('disconnect', () => {
      console.log('Client disconnected:', socket.id);
    });
  });
};

/**
 * Send recent activities to a socket
 * @param {SocketIO.Socket} socket - Socket to send activities to
 * @param {Object} options - Query options
 */
const sendRecentActivities = async (socket, options = {}) => {
  try {
    const activities = await getRecentActivities(options);
    socket.emit('recent_activities', activities);
  } catch (error) {
    console.error('Error sending recent activities:', error);
    socket.emit('error', { message: 'Failed to get recent activities' });
  }
};

/**
 * Emit activity to all connected clients
 * @param {SocketIO.Server} io - Socket.IO server instance
 * @param {Object} activity - Activity to emit
 */
const emitActivity = (io, activity) => {
  if (!io) {
    console.warn('Socket.IO not available, activity event not emitted');
    return;
  }
  io.emit('activity', activity);
};

module.exports = {
  setupSocketEvents,
  emitActivity
};
