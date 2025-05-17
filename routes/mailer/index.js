const express = require("express");
const router = express.Router();
const mailer = require("nodemailer");

router.get("/", (req, res) => {
    res.status(405).json({
        status: "failed",
        statusCode: 405,
        message: "Method not allowed"
    })
})

router.post("/send", async (req, res) => {
    const { recipient, subject, body } = req.body;

    if (!recipient || !subject || !body) {
        res.status(400).json({
            status: "failed",
            statusCode: 400,
            message: "Require recipient, subject and body as parameters"
        })
    }

    try {
        const transporter = mailer.createTransport({
            service: "gmail",
            auth: {
                user: process.env.GOOGLE_EMAIL_ADDRESS,
                pass: process.env.GOOGLE_EMAIL_APP_PASSWORD
            },
        });

        const mailOptions = {
            from: '"Gulfflora"<orders@gulfflora.com>',
            to: recipient,
            cc: "orders@gulfflora.com",
            subject: subject,
            html: body
        };

        transporter.sendMail(mailOptions, (error, response) => {
            if (error) {
                res.status(404).json({
                    status: "failed",
                    statusCode: 404,
                    message: error
                })
            }
            res.status(200).json({
                status: "success",
                statusCode: 200,
                response
            })
        })
    } catch (error) {
        res.status(500).json({
            status: "failed",
            statusCode: 500,
            message: error
        })
    }
})

module.exports = router;