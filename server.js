require("dotenv").config();

const express = require("express");
const app = express();
const port = 4000;
const cors = require("cors");

const routes = require("./routes");

app.use(cors());
app.use(express.json());

app.use("/", routes);

app.listen(port, () => {
    console.log("Server is running");
})

module.exports = app;