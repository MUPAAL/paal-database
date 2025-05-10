/**
 * Utility to validate routes and check for duplicates
 */

/**
 * Check for duplicate route registrations
 * @param {Array} routes - Array of route paths
 * @returns {Array} Array of duplicate routes
 */
const findDuplicateRoutes = (routes) => {
  const routeMap = {};
  const duplicates = [];

  routes.forEach(route => {
    if (routeMap[route]) {
      duplicates.push(route);
    } else {
      routeMap[route] = true;
    }
  });

  return duplicates;
};

module.exports = {
  findDuplicateRoutes
};
