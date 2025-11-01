const express = require("express");
const getDatabase = require("../../../utils/mongodb/database");
const router = express.Router();
const multer = require("multer");
const uploads = multer({ storage: multer.memoryStorage() });
const xlsx = require("xlsx");

function safeParseJSON(value) {
    try {
        if (typeof value !== "string") return value;
        const once = JSON.parse(value);
        if (typeof once === "string" && once.trim().startsWith("{")) {
            return JSON.parse(once);
        }
        return once;
    } catch (e) {
        console.warn("Invalid JSON:", value);
        return value;
    }
}

router.get("/", async (req, res) => {
    try {
        const database = await getDatabase();
        const collections = await database.collection("gulfflora_collections").find({}).toArray();

        if (collections.length > 0) {
            return res.status(200).json({
                status: "success",
                statusCode: 200,
                collections
            });
        }

        return res.status(404).json({
            status: "failed",
            statusCode: 404,
            message: "No collections found"
        });
    } catch (error) {
        return res.status(500).json({
            status: "failed",
            statusCode: 500,
            message: error.message || "Internal server error"
        });
    }
});

router.get("/delete", async (req, res) => {
    try {
        const database = await getDatabase();
        const deleteCollections = await database.collection("gulfflora_collections").deleteMany({});

        if (deleteCollections) {
            return res.status(200).json({
                status: "success",
                statusCode: 200,
                message: "All collections deleted"
            });
        }

        return res.status(404).json({
            status: "failed",
            statusCode: 404,
            message: "No collections found"
        });
    } catch (error) {
        return res.status(500).json({
            status: "failed",
            statusCode: 500,
            message: error.message || "Internal server error"
        });
    }
});

router.post("/create", uploads.single("file"), async (req, res) => {
    try {
        const workbook = xlsx.read(req.file.buffer, { type: "buffer" });
        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        const collectionsJson = xlsx.utils.sheet_to_json(sheet);
        const database = await getDatabase();

        const createCollections = await Promise.all(
            collectionsJson.map(async (collection) => {
                if (collection.collection_cities) {
                    collection.collection_cities = collection.collection_cities.split(",").map(c => c.trim());
                }

                collection.collection_meta_title = safeParseJSON(collection.collection_meta_title);
                collection.collection_meta_description = safeParseJSON(collection.collection_meta_description);
                collection.collection_meta_keywords = safeParseJSON(collection.collection_meta_keywords);

                return await database.collection("gulfflora_collections").insertOne(collection);
            })
        );

        if (createCollections) {
            return res.status(200).json({
                status: "success",
                statusCode: 200,
                createCollections
            });
        }

        return res.status(400).json({
            status: "failed",
            statusCode: 400,
            message: "Something went wrong"
        });
    } catch (error) {
        console.error("Upload error:", error);
        return res.status(500).json({
            status: "failed",
            statusCode: 500,
            message: error.message || "Internal server error"
        });
    }
});

router.post("/update", async (req, res) => {
    try {
        const { collection_slug, collection_update } = req.body;
        const database = await getDatabase();

        const updateCollection = await database.collection("gulfflora_collections").updateOne(
            { collection_slug: collection_slug },
            {
            $set: {
                ...collection_update
            }
            }
        );

        if (updateCollection) {
            return res.status(200).json({
                status: "success",
                statusCode: 200,
                updateCollection
            });
        }

        return res.status(400).json({
            status: "failed",
            statusCode: 400,
            message: "Something went wrong"
        });
    } catch (error) {
        console.error("Upload error:", error);
        return res.status(500).json({
            status: "failed",
            statusCode: 500,
            message: error.message || "Internal server error"
        });
    }
});

module.exports = router;