const express = require("express");
const multer = require("multer");
const router = express.Router();

const upload = multer({
    storage: multer.diskStorage({
        destination: "media/images",
        filename: (req, file, cb) => cb(null, file.originalname),
        fileFilter: (req, file, cb) => {
            if (file.mimetype.startsWith("image/")) cb(null, true);
            else cb(new Error("Only image files are allowed"), false);
        }
    })
});

router.post("/create", upload.single("file"), (req, res) => {
    if (!req.file) return res.status(400).json({ status: "failed", message: "No image uploaded" });
    res.status(200).json({ status: "success", message: "Image upload successful", file: req.file });
});

module.exports = router;