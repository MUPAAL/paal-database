#!/bin/bash

# Load environment variables from external .env
set -a
source /env/.env
set +a

echo "$(date +%F\ %T) 🔧 Waiting for MongoDB to be ready..."
until mongosh --host mongo --port 27017 --eval "db.adminCommand('ping')" >/dev/null 2>&1; do
  sleep 1
done

echo "$(date +%F\ %T) 🚀 Authenticating and initializing..."

mongosh --host mongo --port 27017 \
  -u "$MONGO_INITDB_ROOT_USERNAME" \
  -p "$MONGO_INITDB_ROOT_PASSWORD" \
  --authenticationDatabase admin <<EOF

// ========== 1. INITIATE REPLICA SET ==========
try {
  if (rs.status().ok !== 1) {
    throw "Not initialized";
  }
  print("⚠️ Replica set already initialized.");
} catch (e) {
  try {
    rs.initiate({
      _id: "rs0",
      members: [{ _id: 0, host: "mongo:27017" }]
    });
    print("✅ Replica set initiated.");
  } catch (initErr) {
    print("❌ Failed to initiate replica set: " + initErr);
  }
}

// ========== 2. CREATE ROOT USER IF NOT EXISTS ==========
db = db.getSiblingDB("admin");
if (db.getUser("PAAL") === null) {
  db.createUser({
    user: "PAAL",
    pwd: "PAAL",
    roles: [{ role: "root", db: "admin" }]
  });
  print("✅ Root user 'PAAL' created.");
} else {
  print("⚠️ Root user 'PAAL' already exists.");
}

// ========== 3. CREATE DB + COLLECTION IF NOT EXISTS ==========
db = db.getSiblingDB("${MONGO_INITDB_DATABASE}");
const collectionName = "${MONGO_INITDB_DATABASE}";
if (!db.getCollectionNames().includes(collectionName)) {
  db.createCollection(collectionName);
  print("✅ Collection '${MONGO_INITDB_DATABASE}' created in DB '${MONGO_INITDB_DATABASE}'.");
} else {
  print("⚠️ Collection '${MONGO_INITDB_DATABASE}' already exists.");
}
EOF
