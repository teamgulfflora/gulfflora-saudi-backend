const express = require("express");
const { Query } = require("node-appwrite");
const databases = require("../../utils/appwrite/database");
const router = express.Router();

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
                Query.or([
                    Query.contains("collection_name", slug),
                    Query.contains("collection_content", slug),
                    Query.contains("collection_meta_keywords", slug),
                ])
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
            Query.or([
                Query.contains("product_title", slug),
                Query.contains("product_description", slug),
            ])
        ];

        queries.forEach(query => {
            queriesArray.push(
                Query[query.type](...query.values)
            )
        });

        const products = await databases.listDocuments(
            process.env.APPWRITE_DATABASE_ID,
            process.env.APPWRITE_PRODUCTS_DC_ID,
            queriesArray || []
        )
        res.status(200).json({
            status: "success",
            statusCode: 200,
            collections: collections,
            products: products
        })
    } catch (error) {

    }
});

module.exports = router;