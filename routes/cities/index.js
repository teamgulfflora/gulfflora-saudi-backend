const express = require("express");
const database = require("../../utils/appwrite/database");
const { Query } = require("node-appwrite");
const router = express.Router();

router.get("/", async (req, res) => {
    try {
        const collections = await database.listDocuments(
            process.env.APPWRITE_DATABASE_ID,
            process.env.APPWRITE_CITIES_DC_ID
        );

        if (!collections || !collections.documents || collections.documents.length === 0) {
            return res.status(404).json({
                status: "not_found",
                statusCode: 404,
                message: "No collections found"
            });
        }

        return res.status(200).json({
            status: "success",
            statusCode: 200,
            collections: collections.documents
        });

    } catch (error) {
        console.error("Error fetching collections:", error);
        return res.status(500).json({
            status: "error",
            statusCode: 500,
            message: "Internal Server Error"
        });
    }
});

router.post("/", async (req, res) => {
    const { slug, queries } = req.body;

    if (!slug || typeof slug !== "string") {
        return res.status(400).json({
            status: "fail",
            statusCode: 400,
            message: "Invalid or missing 'slug'"
        });
    }

    if (!Array.isArray(queries)) {
        return res.status(400).json({
            status: "fail",
            statusCode: 400,
            message: "'queries' must be an array"
        });
    }

    const queriesArray = [];
    try {
        queries.forEach(query => {
            if (!query.type || !Array.isArray(query.values)) {
                throw new Error("Invalid query format");
            }

            if (typeof Query[query.type] !== "function") {
                throw new Error(`Unsupported query type: ${query.type}`);
            }

            queriesArray.push(Query[query.type](...query.values));
        });
    } catch (err) {
        return res.status(400).json({
            status: "fail",
            statusCode: 400,
            message: `Invalid query parameters: ${err.message}`
        });
    }

    try {
        const cityCollection = await database.listDocuments(
            process.env.APPWRITE_DATABASE_ID,
            process.env.APPWRITE_CITIES_DC_ID,
            [Query.equal("city_slug", slug)]
        );

        if (!cityCollection.documents.length) {
            return res.status(404).json({
                status: "failed",
                statusCode: 404,
                message: "City not found with the provided slug"
            });
        }

        const products = await database.listDocuments(
            process.env.APPWRITE_DATABASE_ID,
            process.env.APPWRITE_PRODUCTS_DC_ID,
            queriesArray
        );

        return res.status(200).json({
            status: "success",
            statusCode: 200,
            city: cityCollection.documents[0],
            products: products || []
        });

    } catch (error) {
        console.error("Error in POST /collections:", error);
        return res.status(500).json({
            status: "error",
            statusCode: 500,
            message: "Internal Server Error"
        });
    }
});

module.exports = router;