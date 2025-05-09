# Server Architecture

This document outlines the architecture of the server application after refactoring.

## Directory Structure

```
server/
├── config/             # Configuration settings
├── db/                 # Database connection and models
├── middleware/         # Express middleware
├── models/             # Mongoose models
├── routes/             # API routes
├── socket/             # Socket.IO related code
├── utils/              # Utility functions
├── index.js            # Legacy entry point (for backward compatibility)
└── server.js           # Main entry point
```

## Components

### Configuration (`config/`)

Contains environment variables and application configuration settings.

- `index.js` - Exports configuration objects for server, database, and CORS.

### Database (`db/`)

Handles database connection and model registration.

- `connection.js` - Manages the MongoDB connection.
- `models.js` - Registers all Mongoose models.

### Middleware (`middleware/`)

Sets up Express middleware.

- `index.js` - Configures CORS, JSON parsing, and other middleware.

### Models (`models/`)

Contains Mongoose schema definitions for the application's data models.

### Routes (`routes/`)

Defines API endpoints.

- `index.js` - Registers all route handlers.
- Various route files for different resources (farms, barns, pigs, etc.).

### Socket (`socket/`)

Manages real-time communication with clients.

- `index.js` - Initializes Socket.IO.
- `events.js` - Sets up Socket.IO event handlers.
- `stats.js` - Handles calculation and emission of statistics.

### Utils (`utils/`)

Contains utility functions used throughout the application.

- `routeValidator.js` - Validates routes and checks for duplicates.

## Starting the Server

The application can be started by running:

```bash
node server/server.js
```

Or for backward compatibility:

```bash
node server/index.js
```

## Key Features

1. **Modular Architecture**: The application is divided into logical components.
2. **Separation of Concerns**: Each component has a specific responsibility.
3. **Error Handling**: Robust error handling throughout the application.
4. **Real-time Updates**: Socket.IO for real-time communication with clients.
5. **Route Validation**: Automatic detection of duplicate route registrations.
