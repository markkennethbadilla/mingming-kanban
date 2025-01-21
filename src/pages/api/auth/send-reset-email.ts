import jwt from "jsonwebtoken";
import nodemailer from "nodemailer";

if (
  !process.env.SECRET_KEY ||
  !process.env.GMAIL_USER ||
  !process.env.GMAIL_APP_PASSWORD
) {
  throw new Error(
    "Environment variables SECRET_KEY, GMAIL_USER, or GMAIL_APP_PASSWORD are not defined"
  );
}

const SECRET_KEY = process.env.SECRET_KEY; // JWT secret
const URL = process.env.URL; 

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res
      .status(405)
      .json({ success: false, message: "Method not allowed" });
  }

  const { email } = req.body;
  if (!email) {
    return res
      .status(400)
      .json({ success: false, message: "Email is required" });
  }

  try {
    // Generate a password reset token (valid for 15 minutes)
    const token = jwt.sign({ email }, SECRET_KEY, { expiresIn: "15m" });

    // Configure SMTP transport
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_APP_PASSWORD,
      },
    });

    // Send email
    await transporter.sendMail({
      from: `"Mingming Task Manager" <${process.env.GMAIL_USER}>`,
      to: email,
      subject: "Password Reset",
      html: `
        <p>You requested a password reset. Click the link below to reset your password:</p>
        <a href="${URL}/update-password?token=${token}">Reset Password</a>
        <p>This link will expire in 15 minutes.</p>
      `,
    });

    return res
      .status(200)
      .json({ success: true, message: "Password reset email sent" });
  } catch (error) {
    console.error("Error sending password reset email:", error);
    return res
      .status(500)
      .json({ success: false, message: "Error sending email" });
  }
}
