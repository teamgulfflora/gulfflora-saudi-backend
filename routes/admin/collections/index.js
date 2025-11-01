const express = require("express");
const getDatabase = require("../../../utils/mongodb/database");
const router = express.Router();

const multer = require("multer");

const uploads = multer({ storage: multer.memoryStorage() });

const xlsx = require("xlsx");

router.get("/", async (req, res) => {
    try {
        const database = await getDatabase();
        const collections = await database.collection("gulfflora_collections").find({}).toArray();

        if (collections.length > 0) {
            return res.status(200).json({
                status: "success",
                statusCode: 200,
                collections
            })
        }
        return res.status(404).json({
            status: "failed",
            statusCode: 404,
            message: "No collections found"
        })
    } catch (error) {
        return res.status(500).json({
            status: "failed",
            statusCode: 500,
            message: error || "Internal server error"
        })
    }
})

router.get("/delete", async (req, res) => {
    try {
        const database = await getDatabase();
        const deleteCollections = await database.collection("gulfflora_collections").deleteMany({});

        if (deleteCollections) {
            return res.status(200).json({
                status: "success",
                statusCode: 200,
                message: "All collections deleted"
            })
        }
        return res.status(404).json({
            status: "failed",
            statusCode: 404,
            message: "No collections found"
        })
    } catch (error) {
        return res.status(500).json({
            status: "failed",
            statusCode: 500,
            message: error || "Internal server error"
        })
    }
})

router.post("/create", uploads.single("file"), async (req, res) => {
    try {
        const collectionsSheet = xlsx.read(req.file.buffer, { type: "buffer" });
        const collectionsJson = xlsx.utils.sheet_to_json(collectionsSheet.Sheets[collectionsSheet.SheetNames[0]]);
        const database = await getDatabase();

        const createCollections = await Promise.all(
            collectionsJson.map(async (collection) => {
                collection.collection_meta_title = JSON.parse(collection.collection_meta_title || "{}");
                collection.collection_meta_description = JSON.parse(collection.collection_meta_description || "{}");
                collection.collection_meta_keywords = JSON.parse(collection.collection_meta_keywords || "[]");
                collection.collection_cities = collection.collection_cities.split(", ").map(c => c.trim());
                return await database.collection("gulfflora_collections").insertOne(collection)
            })
        )

        if (createCollections) {
            return res.status(200).json({
                status: "success",
                statusCode: 200,
                createCollections
            })
        }
        return res.status(400).json({
            status: "failed",
            statusCode: 400,
            message: "Something went wrong"
        })
    } catch (error) {
        return res.status(500).json({
            status: "failed",
            statusCode: 500,
            message: error || "Internal server error"
        })
    }
})

module.exports = router;