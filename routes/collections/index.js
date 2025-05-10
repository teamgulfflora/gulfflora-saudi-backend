const express = require("express");
const { Query } = require("node-appwrite");
const databases = require("../../utils/appwrite/database");
const router = express.Router();

router.get("/", async (req, res) => {
    try {
        const collections = await databases.listDocuments(
            process.env.APPWRITE_DATABASE_ID,
            process.env.APPWRITE_COLLECTIONS_DC_ID
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

    if (!slug) {
        res.status(400).json({
            status: "failed",
            statusCode: 400,
            message: "Slug or queries array missing"
        })
    }

    try {
        const collections = await databases.listDocuments(
            process.env.APPWRITE_DATABASE_ID,
            process.env.APPWRITE_COLLECTIONS_DC_ID,
            [
                Query.equal("collection_slug", slug)
            ]
        )
        if (collections.documents.length == 0) {
            res.status(404).json({
                status: "failed",
                statusCode: 404,
                message: "Collection not found"
            })
        }

        const queriesArray = [
            Query.contains("product_categories", [collections.documents[0].collection_name])
        ]

        queries.forEach(query => {
            queriesArray.push(
                Query[query.type](...query.values)
            )
        });

        const collectionProducts = await databases.listDocuments(
            process.env.APPWRITE_DATABASE_ID,
            process.env.APPWRITE_PRODUCTS_DC_ID,
            queriesArray || []
        )
        res.status(200).json({
            status: "success",
            statusCode: 200,
            collections: collections.documents[0],
            products: collectionProducts,
        })
    } catch (error) {

    }
});

module.exports = router;