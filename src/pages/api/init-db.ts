import { NextApiRequest, NextApiResponse } from 'next';
import sequelize from '@/config/sequelize';

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    console.log('Checking database connection...');
    await sequelize.authenticate();
    console.log('Database connection has been established successfully.');
    await sequelize.sync();
    console.log('Database synchronized.');
    res.status(200).json({ message: 'Database initialized successfully' });
  } catch (error) {
    console.error('Unable to connect to the database:', error);
    res.status(500).json({ error: 'Unable to connect to the database' });
  }
};

export default handler;