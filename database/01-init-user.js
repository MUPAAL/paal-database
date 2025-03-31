// Connect to the 'admin' DB to create the root user
db.createCollection("paalab");
db = db.getSiblingDB("admin");

db.createUser({
  user: "PAAL",
  pwd: "PAAL",
  roles: [{ role: "root", db: "admin" }]
});

// Initiate replica set
rs.initiate({
  _id: "rs0",
  members: [{ _id: 0, host: "mongo-c:27017" }]
});

// Switch to application database and create collection
db = db.getSiblingDB("paalab");


