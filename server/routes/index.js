const { findDuplicateRoutes } = require('../utils/routeValidator');

/**
 * Register all API routes
 * @param {Express} app - Express application
 */
const registerRoutes = (app) => {
  // Define all routes
  const routes = [
    { path: '/api/farms', handler: require('./farm') },
    { path: '/api/barns', handler: require('./barn') },
    { path: '/api/stalls', handler: require('./stall') },
    { path: '/api/devices', handler: require('./devices') },
    { path: '/api/pigs', handler: require('./pig') },
    { path: '/api/temperature', handler: require('./temperatureData') },
    { path: '/api/stats', handler: require('./stats') },
    { path: '/api/upload/postureupload', handler: require('./upload/postureUpload') },
    { path: '/api/systemmanagement', handler: require('./system-management/management') },
    { path: '/api/users', handler: require('./user') },
    { path: '/api/activities', handler: require('./activity') },
    { path: '/api/auth', handler: require('./auth') },
    { path: '/api/system', handler: require('./system') }
    // Note: Removed duplicate '/api/farms' route that was in the original file
  ];

  // Check for duplicate routes
  const routePaths = routes.map(route => route.path);
  const duplicates = findDuplicateRoutes(routePaths);

  if (duplicates.length > 0) {
    console.warn('Warning: Duplicate route registrations detected:', duplicates);
  }

  // Register routes
  routes.forEach(route => {
    app.use(route.path, route.handler);
  });
};

module.exports = {
  registerRoutes
};
