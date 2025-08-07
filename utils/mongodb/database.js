const { MongoClient } = require("mongodb");

const client = new MongoClient(process.env.MONGO_URL);
let db;

async function getDatabase() {
  if (!db) {
    await client.connect();
    console.log("✅ Connected to MongoDB");
    db = client.db("gulfflora_saudi");
  }
  return db;
}

module.exports = getDatabase;