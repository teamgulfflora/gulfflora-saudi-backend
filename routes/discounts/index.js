const express = require("express");
const databases = require("../../utils/appwrite/database");
const { Query } = require("node-appwrite");
const router = express.Router();

router.post("/", async (req, res) => {
    try {
        const currentTime = new Date().getTime();
        const { discount } = req.body;
        const results = await databases.listDocuments(
            process.env.APPWRITE_DATABASE_ID,
            process.env.APPWRITE_DISCOUNTS_DC_ID,
            [
                Query.equal("discount_code", discount)
            ]
        );
        if(results.documents.length > 0) {
            if(currentTime < results.documents[0].discount_expiry){
                res.status(200).json({
                    status: "success",
                    statusCode: 200,
                    discount: results.documents[0]
                })
            }
            res.status(200).json({
                status: "success",
                statusCode: 200,
                message: "Discount expired"
            })
        }
        res.status(404).json({
            status: "failed",
            statusCode: 404,
            message: "Invalid discount"
        })
    } catch (error) {
        
    }
})

router.get("/", (req, res) => {
    res.status(505).json({
        status: "failed",
        statusCode: 505,
        message: "Method not allowed"
    })
})

module.exports = router;