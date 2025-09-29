const express = require("express");
const getDatabase = require("../../utils/mongodb/database");
const router = express.Router();
const { ObjectId } = require("mongodb");

router.get("/all", async (req, res) => {
    try {
        const database = await getDatabase();
        const orders = await database.collection("gulfflora_orders").find({}).toArray();

        if (orders.length > 0) {
            return res.status(200).json({
                status: "success",
                statusCode: 200,
                orders
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
        const database = await getDatabase();
        const createOrder = await database.collection("gulfflora_orders").insertOne(order);

        if(createOrder) {
            const response = await fetch("https://api.noonpayments.com/payment/v1/order", {
                method: "POST",
                headers: {
                    "Content-Type" : "application/json",
                    "Authorization" : `KEY ${process.env.NOON_PAYMENTS_API}`
                },
                body: JSON.stringify({
                    apiOperation: "INITIATE",
                    order: {
                        name : `Gulfflora order ${order?.order_id}`, 
                        amount: order?.order_total,
                        currency: order?.order_currency,
                        reference: order?.order_id,
                        channel: "web",
                        category: "pay"
                    },
                    configuration: {
                        locale: "en",
                        paymentAction: "SALE",
                        returnUrl: `/order/${order?.order_id}`
                    },
                })
            })
            const result = await response.json();
            return res.status(200).json({
                status: "success",
                statusCode: 200,
                result
            });
        }
        else {
            return res.status(400).json({
                status: "failed",
                statusCode: 400,
                message: "Something went wrong with order"
            });
        }
    } catch (error) {
        return res.status(500).json({
            status: "failed",
            statusCode: 500,
            message: error.message || "Internal server error"
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
        const database = await getDatabase();
        const getOrder = await database.collection("gulfflora_orders").find({
            order_id: order_id
        }).toArray();

        if (getOrder.length > 0) {
            const orderId = getOrder[0]._id;
            const updateOrder = await database.collection("gulfflora_orders").updateOne(
                { _id: new ObjectId(orderId) },
                { $set: order }
            );
            return res.status(200).json({
                status: "success",
                statusCode: 200,
                message: "Order has been updated"
            });
        }

        return res.status(404).json({
            status: "failed",
            statusCode: 404,
            message: "No orders found with the provided order_id"
        });
    } catch (error) {
        return res.status(500).json({
            status: "failed",
            statusCode: 500,
            message: error.message || "Internal server error"
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
        const database = await getDatabase();
        const order = await database.collection("gulfflora_orders").find({
            order_id: order_id
        }).toArray();

        if (order.length > 0) {
            return res.status(200).json({
                status: "success",
                statusCode: 200,
                order: order[0]
            })
        }
        return res.status(404).json({
            status: "failed",
            statusCode: 404,
            message: "Order not found"
        });
    } catch (error) {
        return res.status(500).json({
            status: "failed",
            statusCode: 500,
            message: "Failed to retrieve order"
        });
    }
});

module.exports = router;
