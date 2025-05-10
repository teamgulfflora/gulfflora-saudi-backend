const express = require("express");
const router = express.Router();

const multer = require("multer");
const storage = require("../../../utils/appwrite/storage");
const { InputFile } = require("node-appwrite/file");
const { Permission, Role, Query } = require("node-appwrite");

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

module.exports = router;