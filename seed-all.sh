#!/bin/bash

echo "🚀 Starting database setup..."
docker-compose exec backend node server/scripts/seed-all.js

echo "✨ Done!"
