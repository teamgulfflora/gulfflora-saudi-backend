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
    const tokenRes = await fetch("https://api.sendpulse.com/oauth/access_token", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        grant_type: "client_credentials",
        client_id: process.env.SENDPULSE_CLIENT_ID,
        client_secret: process.env.SENDPULSE_CLIENT_SECRET,
      }),
    });
    const tokenData = await tokenRes.json();
    const accessToken = tokenData.access_token;
    const mailRes = await fetch("https://api.sendpulse.com/smtp/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json; charset=utf-8",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({
        email: {
          html: body,
          subject,
          from: { name: "Gulfflora", email: process.env.SENDPULSE_SMTP_EMAIL },
          to: [{ email: recipient }],
          cc: cc ? [{ email: cc }] : [{ email: process.env.SENDPULSE_SMTP_EMAIL }],
        },
      }),
    });
    const response = await mailRes.json();
    return res.status(200).json({
      status: "success",
      statusCode: 200,
      response,
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