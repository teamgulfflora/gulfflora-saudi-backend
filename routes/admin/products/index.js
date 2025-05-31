const express = require("express");
const router = express.Router();

const multer = require("multer");
const storage = require("../../../utils/appwrite/storage");
const { InputFile } = require("node-appwrite/file");
const { Permission, Role, Query, ID } = require("node-appwrite");
const databases = require("../../../utils/appwrite/database");

const xlsx = require("xlsx");

const uploads = multer({ storage: multer.memoryStorage() });

router.post("/", uploads.array("files"), async (req, res) => {
    const files = req.files;

    try {
        const uploads = await Promise.all(
            files.map(async (file) => {
                const fileName = file.originalname.replace(".webp", "");
                const fileToUpload = InputFile.fromBuffer(file.buffer, fileName);

                const response = await storage.createFile(
                    process.env.APPWRITE_STORAGE_BUCKET_ID,
                    fileName,
                    fileToUpload,
                    [
                        Permission.read(Role.any()),
                        Permission.write(Role.any()),
                        Permission.delete(Role.any()),
                        Permission.update(Role.any()),
                    ]
                )

                return response;
            })
        )
        res.json({
            uploads
        });
    } catch (error) {
        res.status(500).json({
            error
        })
    }
})

router.get("/", async (req, res) => {
    const images = await storage.listFiles(
        process.env.APPWRITE_STORAGE_BUCKET_ID,
        [
            Query.limit(100),
        ]
    )

    const imagesArray = [];
    images.files.map((image) => {
        imagesArray.push(image.$id);
    })

    const deleteFiles = imagesArray.map(async (fileId) => {
        const deleteStatus = await storage.deleteFile(
            process.env.APPWRITE_STORAGE_BUCKET_ID,
            fileId
        )
        return deleteStatus
    })
    res.json({
        deleteFiles
    })
})

router.post("/create", uploads.single("file"), async (req, res) => {
    try {
        const fileBuffer = req.file.buffer;
        const currentSheet = xlsx.read(fileBuffer, { type: "buffer" });
        const productsJson = xlsx.utils.sheet_to_json(currentSheet.Sheets[currentSheet.SheetNames[0]]);

        const createdProducts = await Promise.all(productsJson.map(async (product) => {
            if (typeof product.product_categories === "string") {
                product.product_categories = product.product_categories
                    .split(",")
                    .map(cat => cat.trim())
                    .filter(cat => cat.length > 0);
            }

            return await databases.createDocument(
                process.env.APPWRITE_DATABASE_ID,
                process.env.APPWRITE_PRODUCTS_DC_ID,
                ID.unique(),
                product
            );
        }));

        res.json({
            createdProducts
        });
    } catch (error) {
        res.status(500).json({
            error: error.message || "Failed to process file and create products"
        });
    }
});


router.post("/delete", async (req, res) => {
    try {
        const products = await databases.listDocuments(
            process.env.APPWRITE_DATABASE_ID,
            process.env.APPWRITE_PRODUCTS_DC_ID,
            [
                Query.limit(100)
            ]
        )
        const deleteProducts = await Promise.all(
            products.documents.map(async(product)=>{
                const deletedProduct = await databases.deleteDocument(
                    process.env.APPWRITE_DATABASE_ID,
                    process.env.APPWRITE_PRODUCTS_DC_ID,
                    product.$id
                );
                return deletedProduct;
            })
        )
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