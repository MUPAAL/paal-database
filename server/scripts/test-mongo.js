require('dotenv').config();
const { MongoClient } = require('mongodb');

// Connection details
const DATABASE_HOST = process.env.DATABASE_HOST || 'mongo';
const DATABASE_PORT = process.env.DATABASE_PORT || '27017';
const DATABASE_DB = process.env.MONGO_INITDB_DATABASE || 'paalab';
const DATABASE_USERNAME = process.env.MONGO_INITDB_ROOT_USERNAME || 'PAAL';
const DATABASE_PASSWORD = process.env.MONGO_INITDB_ROOT_PASSWORD || 'PAAL';

// Try different connection strings
const connectionStrings = [
  `mongodb://${DATABASE_USERNAME}:${DATABASE_PASSWORD}@mongo:${DATABASE_PORT}/${DATABASE_DB}?authSource=admin`,
  `mongodb://${DATABASE_USERNAME}:${DATABASE_PASSWORD}@${DATABASE_HOST}:${DATABASE_PORT}/${DATABASE_DB}?authSource=admin`,
  `mongodb://${DATABASE_USERNAME}:${DATABASE_PASSWORD}@localhost:${DATABASE_PORT}/${DATABASE_DB}?authSource=admin`,
  `mongodb://localhost:${DATABASE_PORT}/${DATABASE_DB}`
];

async function testMongo() {
  console.log('Testing MongoDB connections...');
  console.log('Environment variables:');
  console.log('DATABASE_HOST:', DATABASE_HOST);
  console.log('DATABASE_PORT:', DATABASE_PORT);
  console.log('DATABASE_DB:', DATABASE_DB);
  console.log('DATABASE_USERNAME:', DATABASE_USERNAME ? '[SET]' : '[NOT SET]');
  console.log('DATABASE_PASSWORD:', DATABASE_PASSWORD ? '[SET]' : '[NOT SET]');
  
  for (const [index, uri] of connectionStrings.entries()) {
    const client = new MongoClient(uri, { connectTimeoutMS: 5000 });
    
    try {
      console.log(`\nTrying connection string #${index + 1}:`);
      console.log(uri.replace(/:([^:@]+)@/, ':****@'));
      
      await client.connect();
      console.log('✅ Connected successfully!');
      
      // List databases
      const adminDb = client.db('admin');
      const dbs = await adminDb.admin().listDatabases();
      console.log('Available databases:');
      dbs.databases.forEach(db => console.log(`- ${db.name}`));
      
      // Check if our database exists
      const dbExists = dbs.databases.some(db => db.name === DATABASE_DB);
      if (dbExists) {
        console.log(`\nDatabase '${DATABASE_DB}' exists`);
        
        // List collections
        const db = client.db(DATABASE_DB);
        const collections = await db.listCollections().toArray();
        console.log('Collections:');
        collections.forEach(coll => console.log(`- ${coll.name}`));
        
        // Check if users collection exists and list users
        if (collections.some(coll => coll.name === 'users')) {
          console.log('\nUsers collection exists');
          const users = await db.collection('users').find({}).toArray();
          console.log(`Found ${users.length} users:`);
          users.forEach(user => console.log(`- ${user.email} (${user.role})`));
        } else {
          console.log('\nUsers collection does not exist');
        }
      } else {
        console.log(`\nDatabase '${DATABASE_DB}' does not exist`);
      }
      
      break; // Stop trying other connection strings if this one worked
    } catch (error) {
      console.error(`❌ Connection failed:`, error.message);
    } finally {
      await client.close();
    }
  }
}

testMongo().catch(console.error);
