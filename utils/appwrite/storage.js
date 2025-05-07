const sdk = require("node-appwrite");
const client = require("./initialize");

const storage = new sdk.Storage(client);

module.exports = storage;