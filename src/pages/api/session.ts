import jwt from 'jsonwebtoken';
import { User } from '../../models';

const SECRET_KEY = 'secret_key';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }

  const token = req.headers.authorization?.split(' ')[1];
  if (!token) {
    return res.status(401).json({ success: false, message: 'Token not provided' });
  }

  try {
    const decoded = jwt.verify(token, SECRET_KEY);

    const user = await User.findByPk(decoded.id, {
      attributes: ['id', 'username', 'email', 'createdAt', 'updatedAt'],
    });

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    return res.status(200).json({ success: true, user });
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ success: false, message: 'Token expired' });
    }

    return res.status(401).json({ success: false, message: 'Invalid token' });
  }
}
