#!/bin/bash

echo "Testing MongoDB connection..."
docker-compose exec backend node /usr/server/server/scripts/test-mongo.js

echo "\nCreating test users..."
docker-compose exec backend node /usr/server/server/scripts/create-direct-users.js

echo "\nDone!"
