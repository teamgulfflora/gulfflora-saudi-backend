const express = require("express");
const getDatabase = require("../../utils/mongodb/database");
const router = express.Router();

router.get("/", async (req, res) => {
    try {
        const database = await getDatabase();
        const products = await database.collection("gulfflora_products").find({}).toArray();

        if (products.length > 0) {
            return res.status(200).json({
                status: "success",
                statusCode: 200,
                products
            });
        }
        return res.status(404).json({
            status: "failed",
            statusCode: 404,
            message: "No orders found"
        });
    } catch (error) {
        return res.status(500).json({
            status: "failed",
            statusCode: 500,
            message: error.message || "Internal server error"
        });
    }
});

router.post("/", async (req, res) => {
    const { slug } = req.body;

    if (!slug) {
        return res.status(400).json({
            status: "failed",
            statusCode: 400,
            message: "Product slug is missing"
        });
    }

    try {
        const database = await getDatabase();
        const product = await database.collection("gulfflora_products").find({
            product_slug: slug
        }).toArray();

        if (product.length > 0) {
            return res.status(200).json({
                status: "success",
                statusCode: 200,
                product
            })
        }
        return res.status(404).json({
            status: "failed",
            statusCode: 404,
            message: "Product not found"
        });
    } catch (error) {
        return res.status(500).json({
            status: "failed",
            statusCode: 500,
            message: "Failed to retrieve product"
        });
    }
});

module.exports = router;
