const express = require("express");
const router = express.Router();
const multer = require("multer");
const xlsx = require("xlsx");
const getDatabase = require("../../../utils/mongodb/database");

const uploads = multer({ storage: multer.memoryStorage() });

router.post("/create", uploads.single("file"), async (req, res) => {
    const database = await getDatabase();

    try {
        const fileBuffer = req.file.buffer;
        const currentSheet = xlsx.read(fileBuffer, { type: "buffer" });
        const productsJson = xlsx.utils.sheet_to_json(currentSheet.Sheets[currentSheet.SheetNames[1]]);

        const createdProducts = await Promise.all(productsJson.map(async (product) => {
            if (!product.product_title?.trim()) return null;
            return await database.collection("gulfflora_products").insertOne({
                product_title: product.product_title,
                product_slug: product.product_slug,
                product_description: product.product_description,
                product_sku: product.product_sku,
                product_price: product.product_price,
                product_categories: product.product_categories.split(", "),
                createdAt: new Date()
            });
        }));

        res.json({
            createdProducts
        });
    } catch (error) {
        res.status(500).json({
            error: error.message || "Internal server error"
        });
    }
});


router.post("/delete", async (req, res) => {
    try {
        const database = await getDatabase();
        const deleteProducts = await database.collection("gulfflora_products").deleteMany({});
        res.json({
            deleteProducts
        })
    } catch (error) {
        res.status(500).json({
            error: error.message || "Failed to process file and create products"
        });
    }
});

module.exports = router;