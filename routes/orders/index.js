const express = require("express");
const databases = require("../../utils/appwrite/database");
const { Query } = require("node-appwrite");
const router = express.Router();

router.get("/all", async (req, res) => {
    try {
        const orders = await databases.listDocuments(
            process.env.APPWRITE_DATABASE_ID,
            process.env.APPWRITE_ORDERS_DC_ID
        );
        return res.status(200).json({
            status: "success",
            statusCode: 200,
            orders
        });
    } catch (error) {
        return res.status(500).json({
            status: "failed",
            statusCode: 500,
            message: "Internal Server Error"
        });
    }
})

router.post("/create", async (req, res) => {
    const { order } = req.body;
    try {
        const createOrder = await databases.createDocument(
            process.env.APPWRITE_DATABASE_ID,
            process.env.APPWRITE_ORDERS_DC_ID,
            "unique()",
            order
        )
        return res.status(200).json({
            status: "success",
            statusCode: 200,
            createOrder
        });
    } catch (error) {
        return res.status(500).json({
            status: "failed",
            statusCode: 500,
            message: error
        });
    }
})

router.post("/update", async (req, res) => {
    const { order_id, order } = req.body;

    if (!order_id || !order) {
        res.status(400).json({
            status: "failed",
            statusCode: 400,
            message: "Order is or order details missing"
        })
    }
    try {
        const getOrderDetails = await databases.listDocuments(
            process.env.APPWRITE_DATABASE_ID,
            process.env.APPWRITE_ORDERS_DC_ID,
            [
                Query.equal("order_id", order_id)
            ]
        );

        if (!getOrderDetails.documents.length) {
            res.status(404).json({
                status: "failed",
                statusCode: 404,
                message: "Order not found"
            })
        }

        const updateOrder = await databases.updateDocument(
            process.env.APPWRITE_DATABASE_ID,
            process.env.APPWRITE_ORDERS_DC_ID,
            getOrderDetails.documents[0].$id,
            order
        )

        res.status(200).json({
            status: "success",
            statusCode: 200,
            updateOrder
        })

    } catch (error) {
        return res.status(500).json({
            status: "failed",
            statusCode: 500,
            message: error
        });
    }
})

router.post("/get", async (req, res) => {
    const { order_id } = req.body;

    if (!order_id) {
        res.status(400).json({
            status: "failed",
            statusCode: 400,
            message: "Order id is missing"
        })
    }
    try {
        const order = await databases.listDocuments(
            process.env.APPWRITE_DATABASE_ID,
            process.env.APPWRITE_ORDERS_DC_ID,
            [
                Query.equal("order_id", order_id)
            ]
        );

        if (order.documents.length < 1) {
            res.status(401).json({
                status: "failed",
                statusCode: 401,
                message: "Order not found"
            })
        }
        res.status(200).json({
                status: "success",
                statusCode: 200,
                order
            })

    } catch (error) {
        return res.status(500).json({
            status: "failed",
            statusCode: 500,
            message: error
        });
    }
})

module.exports = router;