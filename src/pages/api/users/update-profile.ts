// Filename: src/pages/api/users/update-profile.ts
import { NextApiRequest, NextApiResponse } from 'next';
import { User } from '../../../models';
import jwt from 'jsonwebtoken';

const SECRET_KEY = 'secret_key';

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
    await user.update({ username, email, ...(password && { password }) });
    res.status(200).json({ success: true, message: 'Profile updated successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Error updating profile' });
  }
}
