// Wait to connect to Mongo and initiate replica set
db = db.getSiblingDB("admin");

try {
    rs.initiate({
        _id: "rs0",
        members: [{ _id: 0, host: "mongo-c:27017" }]
    });
    print("✅ Replica set initiated.");
} catch (e) {
    print("⚠️ Replica set may already be initialized: " + e);
}

// Create admin user
db.createUser({
    user: "PAAL",
    pwd: "PAAL",
    roles: [{ role: "root", db: "admin" }]
});
print("✅ Root user created.");

// Switch to app DB and create collection
db = db.getSiblingDB("paalab");
db.createCollection("paalab");
print("✅ Collection 'paalab' created in DB 'paalab'.");
