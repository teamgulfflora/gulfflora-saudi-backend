const express = require("express");
const router = express.Router();
const nodemailer = require("nodemailer");

// Gmail SMTP transporter
const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
  auth: {
    user: process.env.GOOGLE_EMAIL_ADDRESS,
    pass: process.env.GOOGLE_EMAIL_APP_PASSWORD,
  },
  connectionTimeout: 20000,
  greetingTimeout: 20000,
  socketTimeout: 20000,
});

// Verify transporter
transporter.verify((err, success) => {
  if (err) console.error("SMTP connection failed:", err);
  else console.log("SMTP ready to send emails");
});

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
    const mailOptions = {
      from: `"Gulfflora" <${process.env.GOOGLE_EMAIL_ADDRESS}>`,
      to: recipient,
      cc: process.env.GOOGLE_EMAIL_ADDRESS,
      subject: subject,
      html: body,
    };

    const info = await transporter.sendMail(mailOptions);

    return res.status(200).json({
      status: "success",
      statusCode: 200,
      response: info,
    });

  } catch (error) {
    console.error("Email sending error:", error);
    return res.status(500).json({
      status: "failed",
      statusCode: 500,
      message: error.message || "Email sending failed",
    });
  }
});

module.exports = router;