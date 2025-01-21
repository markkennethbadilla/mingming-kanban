import { NextApiRequest, NextApiResponse } from 'next';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { User } from '../../../models';

if (!process.env.SECRET_KEY) {
  throw new Error('SECRET_KEY environment variable is not defined');
}
const SECRET_KEY = process.env.SECRET_KEY;

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res
      .status(405)
      .json({ success: false, message: 'Method not allowed' });
  }

  const { email, password } = req.body;

  if (!email || !password) {
    return res
      .status(400)
      .json({ success: false, message: 'Email and password are required' });
  }

  try {
    const user = await User.findOne({
      where: { email },
      attributes: ['id', 'username', 'email', 'password'], // Explicitly include required fields
    });

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: 'User not found' });
    }

    const isValidPassword = await bcrypt.compare(
      password,
      user.dataValues.password
    );

    if (!isValidPassword) {
      return res
        .status(401)
        .json({ success: false, message: 'Invalid credentials' });
    }

    const token = jwt.sign({ id: user.dataValues.id }, SECRET_KEY, {
      expiresIn: '1h',
    });

    return res.status(200).json({
      success: true,
      token,
      user: {
        id: user.dataValues.id,
        username: user.dataValues.username,
        email: user.dataValues.email,
      },
    });
  } catch (error) {
    console.error('Login Error:', error);
    return res
      .status(500)
      .json({ success: false, message: 'Error logging in' });
  }
}
