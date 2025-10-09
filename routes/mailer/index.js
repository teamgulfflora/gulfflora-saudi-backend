const express = require("express");
const router = express.Router();

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
    const response = await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: {
        accept: "application/json",
        "content-type": "application/json",
        "api-key": process.env.BREVO_API_KEY,
      },
      body: JSON.stringify({
        sender: {
          name: "Gulfflora",
          email: process.env.BREVO_SENDER_EMAIL,
        },
        to: [
          {
            email: recipient,
          },
          { email: "orders@gulfflora.com", name: "Gulfflora" }
        ],
        subject,
        htmlContent: body,
      }),
    });

    const result = await response.json();

    return res.status(200).json({
      status: "success",
      statusCode: 200,
      result,
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