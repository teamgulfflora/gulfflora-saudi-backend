const express = require("express");
const databases = require("../../utils/appwrite/database");
const { Query } = require("node-appwrite");
const router = express.Router();

router.post("/", async (req, res) => {
    const { discount } = req.body;

    if (!discount || typeof discount !== "string") {
        return res.status(400).json({
            status: "failed",
            statusCode: 400,
            message: "Missing or invalid discount code"
        });
    }

    try {
        const currentTime = Date.now();

        const results = await databases.listDocuments(
            process.env.APPWRITE_DATABASE_ID,
            process.env.APPWRITE_DISCOUNTS_DC_ID,
            [Query.equal("discount_code", discount)]
        );

        const discountData = results?.documents?.[0];

        if (!discountData) {
            return res.status(404).json({
                status: "failed",
                statusCode: 404,
                message: "Invalid discount code"
            });
        }

        if (currentTime < discountData.discount_expiry) {
            return res.status(200).json({
                status: "success",
                statusCode: 200,
                discount: discountData
            });
        }

        return res.status(200).json({
            status: "success",
            statusCode: 200,
            message: "Discount expired"
        });

    } catch (error) {
        console.error("POST /discount error:", error);
        return res.status(500).json({
            status: "failed",
            statusCode: 500,
            message: "Internal Server Error"
        });
    }
});

router.get("/", (req, res) => {
    return res.status(405).json({
        status: "failed",
        statusCode: 405,
        message: "Method not allowed"
    });
});

module.exports = router;