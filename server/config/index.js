require('dotenv').config();

// Server configuration
// Force port 5005 to match nginx configuration regardless of environment variables
const SERVER_PORT = 5005;

// Database configuration
const DATABASE_CONFIG = {
  host: process.env.DATABASE_HOST,
  port: process.env.DATABASE_PORT,
  database: process.env.MONGO_INITDB_DATABASE,
  username: process.env.MONGO_INITDB_ROOT_USERNAME,
  password: process.env.MONGO_INITDB_ROOT_PASSWORD,
  get uri() {
    return `mongodb://${this.username}:${this.password}@mongo:${this.port}/${this.database}?replicaSet=rs0&authSource=admin`;
  }
};

// CORS configuration
const CORS_CONFIG = {
  origin: "*",
  methods: ["GET", "POST", "DELETE", "PUT"]
};

module.exports = {
  SERVER_PORT,
  DATABASE_CONFIG,
  CORS_CONFIG
};
