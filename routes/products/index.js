const express = require("express");
const databases = require("../../utils/appwrite/database");
const { Query } = require("node-appwrite");
const router = express.Router();

router.get("/", async (req, res) => {
    try {
        const products = await databases.listDocuments(
            process.env.APPWRITE_DATABASE_ID,
            process.env.APPWRITE_PRODUCTS_DC_ID,
            [Query.limit(100)]
        );

        const docs = products?.documents || [];

        if (docs.length === 0) {
            return res.status(404).json({
                status: "failed",
                statusCode: 404,
                message: "No products found"
            });
        }

        return res.status(200).json({
            status: "success",
            statusCode: 200,
            products: docs
        });

    } catch (error) {
        console.error("Error fetching products:", error);
        return res.status(500).json({
            status: "failed",
            statusCode: 500,
            message: "Internal Server Error"
        });
    }
});

router.post("/", async (req, res) => {
    const { queries } = req.body;

    if (!Array.isArray(queries)) {
        return res.status(400).json({
            status: "failed",
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
            status: "failed",
            statusCode: 400,
            message: `Invalid query parameters: ${err.message}`
        });
    }

    try {
        const products = await databases.listDocuments(
            process.env.APPWRITE_DATABASE_ID,
            process.env.APPWRITE_PRODUCTS_DC_ID,
            queriesArray
        );

        return res.status(200).json({
            status: "success",
            statusCode: 200,
            products: products?.documents || []
        });

    } catch (error) {
        console.error("Error in POST /products:", error);
        return res.status(500).json({
            status: "error",
            statusCode: 500,
            message: "Internal Server Error"
        });
    }
});

router.post("/product", async (req, res) => {
    const { slug } = req.body;

    if (!slug || typeof slug !== "string") {
        return res.status(400).json({
            status: "failed",
            statusCode: 400,
            message: "Invalid or missing 'slug'"
        });
    }

    try {
        const product = await databases.listDocuments(
            process.env.APPWRITE_DATABASE_ID,
            process.env.APPWRITE_PRODUCTS_DC_ID,
            [Query.equal("product_slug", [slug])]
        );

        const docs = product?.documents || [];

        if (docs.length === 0) {
            return res.status(404).json({
                status: "failed",
                statusCode: 404,
                message: "Product not found with the given slug"
            });
        }

        return res.status(200).json({
            status: "success",
            statusCode: 200,
            product: docs[0]
        });

    } catch (error) {
        console.error("Error fetching product:", error);
        return res.status(500).json({
            status: "failed",
            statusCode: 500,
            message: "Internal Server Error"
        });
    }
});

module.exports = router;