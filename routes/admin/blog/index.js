const express = require("express");
const router = express.Router();
const getDatabase = require("../../../utils/mongodb/database");

router.post("/create", async (req, res) => {
    const { blog_title, blog_slug, blog_content, blog_image, blog_categories } = req.body;
    if (!blog_title || !blog_slug || !blog_content || !blog_image || !blog_categories) {
        return res.status(400).json({
            status: "failed",
            statusCode: 400,
            message: "Require blog title, slug, content, image and categories as parameters"
        })
    }

    try {
        const currentTimestamp = Date.now();
        const database = await getDatabase();
        const blog = await database.collection("gulfflora_blogs").insertOne({
            blog_title,
            blog_slug,
            blog_content,
            blog_image,
            blog_categories,
            createdAt: currentTimestamp
        });
        return res.status(200).json({
            status: "success",
            statusCode: 200,
            blog
        })
    } catch (error) {
        return res.status(500).json({
            status: "failed",
            statusCode: 500,
            message: error || "Internal server error"
        })
    }
})

module.exports = router;