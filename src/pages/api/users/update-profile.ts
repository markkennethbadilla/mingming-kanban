import { NextApiRequest, NextApiResponse } from 'next';
import bcrypt from 'bcrypt';
import { User } from '../../../models';
import jwt from 'jsonwebtoken';

if (!process.env.SECRET_KEY) {
  throw new Error('SECRET_KEY environment variable is not defined');
}
const SECRET_KEY = process.env.SECRET_KEY;

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'PUT') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }

  const token = req.headers.authorization?.split(' ')[1];
  if (!token) {
    return res.status(401).json({ success: false, message: 'Token not provided' });
  }

  try {
    const decoded: any = jwt.verify(token, SECRET_KEY);
    const user = await User.findByPk(decoded.id);

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const { username, email, password } = req.body;

    // Prepare the update data
    const updateData: any = { username, email };
    if (password) {
      const hashedPassword = await bcrypt.hash(password, 10);
      updateData.password = hashedPassword;
    }

    // Update user
    await user.update(updateData);

    res.status(200).json({ success: true, message: 'Profile updated successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Error updating profile' });
  }
}
