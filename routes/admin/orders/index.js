const express = require("express");
const getDatabase = require("../../../utils/mongodb/database");
const router = express.Router();
const multer = require("multer");
const uploads = multer({ storage: multer.memoryStorage() });
const xlsx = require("xlsx");

router.get("/", async (req, res) => {
    try {
        const database = await getDatabase();
        const orders = await database.collection("gulfflora_orders").find({}).toArray();

        if (orders.length > 0) {
            res.status(200).json({
                status: "success",
                statusCode: 200,
                orders
            })
        }
        res.status(404).json({
            status: "failed",
            statusCode: 404,
            message: "No orders found"
        })
    } catch (error) {
        res.status(500).json({
            status: "failed",
            statusCode: 500,
            message: error || "Internal server error"
        })
    }
})

router.get("/delete", async (req, res) => {
    try {
        const database = await getDatabase();
        const orders = await database.collection("gulfflora_orders").deleteMany({});

        if (orders) {
            res.status(200).json({
                status: "success",
                statusCode: 200,
                orders
            })
        }
        res.status(404).json({
            status: "failed",
            statusCode: 404,
            message: "There were no orders or couldn't delete orders"
        })
    } catch (error) {
        res.status(500).json({
            status: "failed",
            statusCode: 500,
            message: error || "Internal server error"
        })
    }
})

router.post("/create", uploads.single("file"), async (req, res) => {
    try {
        const loadedSheet = xlsx.read(req.file.buffer, { type: "buffer" });
        const ordersJson = xlsx.utils.sheet_to_json(loadedSheet.Sheets[loadedSheet.SheetNames[0]]);
        const database = await getDatabase();

        const insertedOrder = await Promise.all(
            ordersJson.map(async (order, index) => {
                return await database.collection("gulfflora_orders").insertOne(order);
            })
        )

        res.status(200).json({
            status: "success",
            statusCode: 200,
            insertedOrder
        })

    } catch (error) {
        res.status(500).json({
            status: "failed",
            statusCode: 500,
            message: error || "Internal server error"
        })
    }
})

module.exports = router;