#!/bin/bash

echo "Stopping containers..."
docker-compose down

echo "Removing node_modules volumes to ensure clean build..."
docker volume rm backend-node-modules frontend-node-modules 2>/dev/null || true

echo "Building containers with optimized settings..."
DOCKER_BUILDKIT=1 COMPOSE_DOCKER_CLI_BUILD=1 docker-compose build --no-cache

echo "Starting containers..."
NODE_ENV=development docker-compose up -d

echo "Waiting for containers to start..."
sleep 10

echo "Seeding database..."
./seed-users.sh

echo "Done! You can now access the application at http://localhost:3000"
