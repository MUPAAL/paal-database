#!/bin/bash

echo "🚀 FIXING DATABASE CONNECTION"
echo "==========================="

# Set the correct database host
export DATABASE_HOST=mongo

# Run the create-admin script
echo "👤 CREATING ADMIN USER"
echo "===================="
docker-compose exec backend node server/scripts/create-admin.js

echo "✨ Done!"
