const express = require("express");
const router = express.Router();

const multer = require("multer");
const storage = require("../../../utils/appwrite/storage");
const { InputFile } = require("node-appwrite/file");

const uploads = multer({ storage: multer.memoryStorage() });

router.post("/", uploads.array("files"), async (req, res) => {
    const files = req.files;

    const uploads = await Promise.all(
        files.map(async (file) => {
            const fileName = file.originalname.replace(".webp", "");
            const fileToUpload = InputFile.fromBuffer(file.buffer, file.originalname);

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
    })
})

module.exports = router;