const express = require("express");
const router = express.Router();
const nodemailer = require("nodemailer");

// SMTP transporter
const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false, // use TLS
  auth: {
    user: process.env.GOOGLE_EMAIL_ADDRESS,
    pass: process.env.GOOGLE_EMAIL_APP_PASSWORD,
  },
  tls: {
    rejectUnauthorized: false,
  },
  connectionTimeout: 20000,
  greetingTimeout: 20000,
  socketTimeout: 20000,
});

// Verify SMTP connection
transporter.verify((err, success) => {
  if (err) console.error("SMTP connection failed:", err);
  else console.log("SMTP ready to send emails");
});

// Block GET or other methods on the base route
router.all("/", (req, res) => {
  res.status(405).json({
    status: "failed",
    statusCode: 405,
    message: "Method not allowed",
  });
});

// POST route to send email
router.post("/send", async (req, res) => {
  const { recipient, subject, body } = req.body;

  if (!recipient || !subject || !body) {
    return res.status(400).json({
      status: "failed",
      statusCode: 400,
      message: "recipient, subject, and body are required",
    });
  }

  try {
    const info = await transporter.sendMail({
      from: `"Gulfflora" <${process.env.GOOGLE_EMAIL_ADDRESS}>`,
      to: recipient,
      cc: process.env.GOOGLE_EMAIL_ADDRESS,
      subject,
      html: body,
    });

    res.status(200).json({
      status: "success",
      statusCode: 200,
      response: info,
    });
  } catch (err) {
    console.error("Email sending error:", err);
    res.status(500).json({
      status: "failed",
      statusCode: 500,
      message: err.message || "Email sending failed",
    });
  }
});

module.exports = router;