const express = require("express");
const databases = require("../../utils/appwrite/database");
const { Query } = require("node-appwrite");
const router = express.Router();

router.get("/all", async (req, res) => {
    try {
        const orders = await databases.listDocuments(
            process.env.APPWRITE_DATABASE_ID,
            process.env.APPWRITE_ORDERS_DC_ID,
            [
                Query.limit(100)
            ]
        );
        return res.status(200).json({
            status: "success",
            statusCode: 200,
            orders: orders?.documents || []
        });
    } catch (error) {
        console.error("GET /all error:", error);
        return res.status(500).json({
            status: "failed",
            statusCode: 500,
            message: "Internal Server Error"
        });
    }
});

router.post("/create", async (req, res) => {
    const { order } = req.body;

    if (!order || typeof order !== "object") {
        return res.status(400).json({
            status: "failed",
            statusCode: 400,
            message: "Missing or invalid order data"
        });
    }

    try {
        const createOrder = await databases.createDocument(
            process.env.APPWRITE_DATABASE_ID,
            process.env.APPWRITE_ORDERS_DC_ID,
            "unique()",
            order
        );
        return res.status(200).json({
            status: "success",
            statusCode: 200,
            order: createOrder
        });
    } catch (error) {
        console.error("POST /create error:", error);
        return res.status(500).json({
            status: "failed",
            statusCode: 500,
            message: "Failed to create order"
        });
    }
});

router.post("/update", async (req, res) => {
    const { order_id, order } = req.body;

    if (!order_id || !order || typeof order !== "object") {
        return res.status(400).json({
            status: "failed",
            statusCode: 400,
            message: "Missing order ID or update data"
        });
    }

    try {
        const results = await databases.listDocuments(
            process.env.APPWRITE_DATABASE_ID,
            process.env.APPWRITE_ORDERS_DC_ID,
            [Query.equal("order_id", order_id)]
        );

        const existingOrder = results?.documents?.[0];
        if (!existingOrder) {
            return res.status(404).json({
                status: "failed",
                statusCode: 404,
                message: "Order not found"
            });
        }

        const updated = await databases.updateDocument(
            process.env.APPWRITE_DATABASE_ID,
            process.env.APPWRITE_ORDERS_DC_ID,
            existingOrder.$id,
            order
        );

        return res.status(200).json({
            status: "success",
            statusCode: 200,
            order: updated
        });

    } catch (error) {
        console.error("POST /update error:", error);
        return res.status(500).json({
            status: "failed",
            statusCode: 500,
            message: "Failed to update order"
        });
    }
});

router.post("/get", async (req, res) => {
    const { order_id } = req.body;

    if (!order_id) {
        return res.status(400).json({
            status: "failed",
            statusCode: 400,
            message: "Order ID is missing"
        });
    }

    try {
        const results = await databases.listDocuments(
            process.env.APPWRITE_DATABASE_ID,
            process.env.APPWRITE_ORDERS_DC_ID,
            [Query.equal("order_id", order_id)]
        );

        const order = results?.documents?.[0];
        if (!order) {
            return res.status(404).json({
                status: "failed",
                statusCode: 404,
                message: "Order not found"
            });
        }

        return res.status(200).json({
            status: "success",
            statusCode: 200,
            order
        });

    } catch (error) {
        console.error("POST /get error:", error);
        return res.status(500).json({
            status: "failed",
            statusCode: 500,
            message: "Failed to retrieve order"
        });
    }
});

module.exports = router;