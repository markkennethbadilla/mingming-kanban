import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { User } from "../../../models";

if (!process.env.SECRET_KEY) {
  throw new Error("SECRET_KEY environment variable is not defined");
}

const SECRET_KEY = process.env.SECRET_KEY;

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ success: false, message: "Method not allowed" });
  }

  const { token, password } = req.body;
  if (!token || !password) {
    return res.status(400).json({ success: false, message: "Token and password are required" });
  }

  try {
    const decoded: any = jwt.verify(token, SECRET_KEY);
    const user = await User.findOne({ where: { email: decoded.email } });

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    await user.update({ password: hashedPassword });

    return res.status(200).json({ success: true, message: "Password reset successful" });
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return res.status(400).json({ success: false, message: "Token expired" });
    }
    return res.status(500).json({ success: false, message: "Error resetting password" });
  }
}
