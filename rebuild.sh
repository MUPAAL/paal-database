#!/bin/bash

echo "Stopping containers..."
docker-compose down

echo "Building containers..."
docker-compose build --no-cache

echo "Starting containers..."
NODE_ENV=development docker-compose up -d

echo "Waiting for containers to start..."
sleep 10

echo "Seeding database..."
./seed-users.sh

echo "Done! You can now access the application at http://localhost:8080"
