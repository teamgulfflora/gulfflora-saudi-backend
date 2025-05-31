const express = require("express");
const router = express.Router();
const mailer = require("nodemailer");

const transporter = mailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.GOOGLE_EMAIL_ADDRESS,
    pass: process.env.GOOGLE_EMAIL_APP_PASSWORD,
  },
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
      from: '"Gulfflora" <orders@gulfflora.com>',
      to: recipient,
      cc: "orders@gulfflora.com",
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
    return res.status(500).json({
      status: "failed",
      statusCode: 500,
      message: error.message || "Email sending failed",
    });
  }
});

module.exports = router;