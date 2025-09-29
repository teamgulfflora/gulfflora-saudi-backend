const express = require("express");
const router = express.Router();
const nodemailer = require("nodemailer");

router.get("/", (req, res) => {
  return res.status(405).json({
    status: "failed",
    statusCode: 405,
    message: "Method not allowed",
  });
});

router.post("/send", async (req, res) => {
  const { recipient, subject, body } = req.body;

  if (!recipient || !subject || !body) {
    return res.status(400).json({
      status: "failed",
      statusCode: 400,
      message: "Require recipient, subject and body as parameters",
    });
  }

  try {
    const transporter = nodemailer.createTransport({
      host: "smtp-pulse.com",
      port: 587,
      secure: false,
      auth: {
        user: process.env.SENDPULSE_SMTP_EMAIL,
        pass: process.env.SENDPULSE_SMTP_PASSWORD,
      },
    });

    const info = await transporter.sendMail({
      from: `"Gulfflora" <${process.env.SENDPULSE_SMTP_EMAIL}>`,
      to: recipient,
      cc: process.env.SENDPULSE_SMTP_EMAIL,
      subject,
      html: body,
    });

    return res.status(200).json({
      status: "success",
      statusCode: 200,
      response: info,
    });
  } catch (error) {
    return res.status(500).json({
      status: "failed",
      statusCode: 500,
      message: error.message || "Email sending failed",
    });
  }
});

module.exports = router;