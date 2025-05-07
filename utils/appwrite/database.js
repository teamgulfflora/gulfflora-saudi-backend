const sdk = require("node-appwrite");
const client = require("./initialize");

const databases = new sdk.Databases(client);

module.exports = databases;