const express = require("express");
const getDatabase = require("../../../utils/mongodb/database");
const router = express.Router();
const multer = require("multer");
const uploads = multer({ storage: multer.memoryStorage() });
const xlsx = require("xlsx");

router.get("/", async (req, res) => {
    try {
        const database = await getDatabase();
        const cities = await database.collection("gulfflora_cities").find({}).toArray();

        if (cities.length > 0) {
            res.status(200).json({
                status: "success",
                statusCode: 200,
                cities
            })
        }
        res.status(404).json({
            status: "failed",
            statusCode: 404,
            message: "No cities found"
        })
    } catch (error) {
        res.status(500).json({
            status: "failed",
            statusCode: 500,
            message: error || "Internal server error"
        })
    }
})

router.get("/delete", async (req, res) => {
    try {
        const database = await getDatabase();
        const cities = await database.collection("gulfflora_cities").deleteMany({});

        if (cities) {
            res.status(200).json({
                status: "success",
                statusCode: 200,
                cities
            })
        }
        res.status(404).json({
            status: "failed",
            statusCode: 404,
            message: "There were no cities or couldn't delete cities"
        })
    } catch (error) {
        res.status(500).json({
            status: "failed",
            statusCode: 500,
            message: error || "Internal server error"
        })
    }
})

router.post("/create", uploads.single("file"), async (req, res) => {
    try {
        const loadedSheet = xlsx.read(req.file.buffer, { type: "buffer" });
        const citiesJson = xlsx.utils.sheet_to_json(loadedSheet.Sheets[loadedSheet.SheetNames[0]]);
        const database = await getDatabase();

        const insertedCity = await Promise.all(
            citiesJson.map(async (city, index) => {
                return await database.collection("gulfflora_cities").insertOne(city);
            })
        )

        res.status(200).json({
            status: "success",
            statusCode: 200,
            insertedCity
        })

    } catch (error) {
        res.status(500).json({
            status: "failed",
            statusCode: 500,
            message: error || "Internal server error"
        })
    }
})

module.exports = router;