/**
 * Server Entry Point
 *
 * This file is kept for backward compatibility.
 * The server has been refactored into a more modular structure.
 *
 * The new entry point is server.js
 */

// Set the port explicitly to 5005 to match nginx configuration
process.env.PORT = 5005;

// Import and run the refactored server
require('./server');