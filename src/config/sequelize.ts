import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';
// eslint-disable-next-line @typescript-eslint/no-require-imports
const pg = require('pg');

dotenv.config();

const sequelize = new Sequelize(
  process.env.DB_NAME as string,
  process.env.DB_USERNAME as string,
  process.env.DB_PASSWORD as string,
  {
    host: process.env.DB_HOST,
    dialect: 'postgres',
    logging: false,
    ssl: true,
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false,
      },
    },
    dialectModule: pg,
  }
);

// Add this block to sync models with the database
sequelize
  .sync()
  .then(() => {
    console.log('Database & tables synced');
  })
  .catch((err) => {
    console.error('Failed to sync database:', err);
  });

export default sequelize;
