const express = require("express");
const { Query } = require("node-appwrite");
const databases = require("../../utils/appwrite/database");
const router = express.Router();

router.post("/", async (req, res) => {
    const { slug, queries } = req.body;

    if (!slug) {
        return res.status(400).json({
            status: "failed",
            statusCode: 400,
            message: "Missing 'slug'"
        });
    }

    try {
        const collections = await databases.listDocuments(
            process.env.APPWRITE_DATABASE_ID,
            process.env.APPWRITE_COLLECTIONS_DC_ID,
            [
                Query.or([
                    Query.contains("collection_name", slug),
                    Query.contains("collection_content", slug),
                    Query.contains("collection_meta_keywords", slug),
                ])
            ]
        );

        const foundCollections = collections?.documents || [];

        if (foundCollections.length === 0) {
            return res.status(404).json({
                status: "failed",
                statusCode: 404,
                message: "No matching collections found"
            });
        }

        const queriesArray = [
            Query.or([
                Query.contains("product_title", slug),
                Query.contains("product_description", slug),
            ])
        ];

        if (Array.isArray(queries)) {
            queries.forEach(query => {
                if (query.type && Array.isArray(query.values) && typeof Query[query.type] === "function") {
                    queriesArray.push(Query[query.type](...query.values));
                }
            });
        }

        const products = await databases.listDocuments(
            process.env.APPWRITE_DATABASE_ID,
            process.env.APPWRITE_PRODUCTS_DC_ID,
            queriesArray
        );

        return res.status(200).json({
            status: "success",
            statusCode: 200,
            collections: foundCollections,
            products: products?.documents || []
        });

    } catch (error) {
        console.error("Error in POST /search:", error);
        return res.status(500).json({
            status: "failed",
            statusCode: 500,
            message: "Internal Server Error"
        });
    }
});

module.exports = router;