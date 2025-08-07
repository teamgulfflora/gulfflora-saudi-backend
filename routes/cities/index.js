const express = require("express");
const getDatabase = require("../../utils/mongodb/database");
const router = express.Router();

router.get("/", async (req, res) => {
    try {
        const database = await getDatabase();
        const cities = await database.collection("gulfflora_cities").find({}).toArray();

        if (cities.length > 0) {
            return res.status(200).json({
                status: "success",
                statusCode: 200,
                cities
            });
        }

        return res.status(404).json({
            status: "failed",
            statusCode: 404,
            message: "No cities found"
        });
    } catch (error) {
        return res.status(500).json({
            status: "error",
            statusCode: 500,
            message: error.message || "Internal Server Error"
        });
    }
});

router.post("/get", async (req, res) => {
    const { slug, queries, limit, offset } = req.body;

    if (!slug) {
        return res.status(400).json({
            status: "failed",
            statusCode: 400,
            message: "Slug is missing"
        });
    }

    if (!queries || typeof queries !== "object") {
        return res.status(400).json({
            status: "failed",
            statusCode: 400,
            message: "Queries missing or not a valid object"
        });
    }

    try {
        const database = await getDatabase();
        const cities = await database.collection("gulfflora_cities")
            .find({ collections_city_slug: slug })
            .toArray();

        if (cities.length === 0) {
            return res.status(404).json({
                status: "failed",
                statusCode: 404,
                message: "No city found with the provided slug"
            });
        }

        const totalProducts = await database.collection("gulfflora_products")
            .find(queries)
            .toArray();

        const products = await database.collection("gulfflora_products")
            .find(queries)
            .limit(limit || 0)
            .skip(offset || 0)
            .toArray();

        return res.status(200).json({
            status: "success",
            statusCode: 200,
            city: cities[0],
            totalProducts: totalProducts.length,
            products
        });

    } catch (error) {
        return res.status(500).json({
            status: "failed",
            statusCode: 500,
            message: error.message || "Internal server error"
        });
    }
});

module.exports = router;