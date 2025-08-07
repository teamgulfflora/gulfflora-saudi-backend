const express = require("express");
const getDatabase = require("../../utils/mongodb/database");
const router = express.Router();

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

router.post("/get", async (req, res) => {
    const { collection_queries, limit, offset } = req.body;

    if (collection_queries && typeof collection_queries === "object") {
        try {
            const database = await getDatabase();
            const collections = await database.collection("gulfflora_collections").find(collection_queries).toArray();

            if (collections.length > 0) {
                const collectionId = collections[0].collection_id;
                const totalProducts = await database.collection("gulfflora_products").find({product_categories: collectionId}).toArray();
                const collectionProducts = await database.collection("gulfflora_products").find({product_categories: collectionId}).skip(offset || 0).limit(limit || 0).toArray();
                return res.status(200).json({
                    status: "success",
                    statusCode: 200,
                    collection: collections[0],
                    totalProducts: totalProducts.length,
                    products: collectionProducts
                })
            }
        } catch (error) {
            return res.status(500).json({
                status: "failed",
                statusCode: 500,
                message: error || "Internal server error"
            })
        }
    }
    return res.status(400).json({
        status: "failed",
        statusCode: 400,
        message: "Missing queries parameter"
    })
})

module.exports = router;